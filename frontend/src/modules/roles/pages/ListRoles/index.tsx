import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IRole, IRoleFilters } from '#shared/types/backend/IRole';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';
import { translatorPermission, translatePermissions } from '#shared/utils/translatePermissions';

import { CreateRoleModal } from '#modules/roles/components/CreateRole';
import { DeleteRoleModal } from '#modules/roles/components/DeleteRole';
import { InfoRoleModal } from '#modules/roles/components/InfoRole';
import { UpdateRoleModal } from '#modules/roles/components/UpdateRole';
import { filterRoleSchema, IFilterRoleSchema } from '#modules/roles/schema/filterRole.schema';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IRoleFilters> = {
  page: 1,
  sort_by: 'updated_at',
  order_by: 'DESC',
  filters: {
    name: '',
    permission: '',
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListRole() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IRoleFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IRoleFilters>({
      category: 'filters',
      key: 'roles',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'roles',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'roles',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'roles',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteRole, setDeleteRole] = useState<IDeleteModal>(null);
  const [updateRole, setUpdateRole] = useState<IUpdateModal>(null);
  const [createRole, setCreateRole] = useState(false);
  const [infoRole, setInfoRole] = useState<IUpdateModal>(null);

  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();
  const { toast } = useToast();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
    };
  }, [apiConfig]);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterRoleSchema>({
    resolver: yupResolver(filterRoleSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const {
    loading: rolesLoading,
    data: rolesData,
    error: rolesError,
    send: getRoles,
    updateData: updateRolesData,
  } = useGet<IPagingResult<IRole>>({
    url: '/roles',
    lazy: true,
  });

  useEffect(() => {
    if (rolesError) {
      toast({ message: rolesError, severity: 'error' });
    }
  }, [rolesError, toast]);

  useEffect(() => {
    getRoles({ params: apiParams });
  }, [apiParams, getRoles]);

  useEffect(() => {
    const { page, order_by, sort_by, filters } = apiConfig;

    const filtersString = JSON.stringify(removeEmptyFields(filters, true));

    searchParams.set('page', String(page));
    searchParams.set('order_by', order_by);
    searchParams.set('sort_by', sort_by);

    if (filtersString !== '{}') {
      searchParams.set('filters', filtersString);
    } else {
      searchParams.delete('filters');
    }

    setSearchParams(searchParams);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Lista de papeis');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      updateRole: checkPermissions([[PermissionsUser.update_role, PermissionsUser.manage_role]]),
      deleteRole: checkPermissions([[PermissionsUser.delete_role, PermissionsUser.manage_role]]),
      createRole: checkPermissions([[PermissionsUser.create_role, PermissionsUser.manage_role]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleAddRole = useCallback(
    (newData: IRole) => {
      updateRolesData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: [newData, ...current.data],
        };
      });
    },
    [updateRolesData],
  );

  const handleUpdateRole = useCallback(
    (id: string, newData: IRole) => {
      updateRolesData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: current.data.map((role) => (role.id === id ? newData : role)),
        };
      });
    },
    [updateRolesData],
  );

  const handleDeleteRole = useCallback(
    (id: string) => {
      updateRolesData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: current.data.filter((role) => role.id !== id),
        };
      });
    },
    [updateRolesData],
  );

  const handleApplyFilters = useCallback(
    (formData: IFilterRoleSchema) => {
      const filtersValue = { ...formData, permission: formData.permission?.permission || '' };

      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: filtersValue,
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'roles',
        value: filtersValue,
        localStorage: true,
      });
    },
    [updateState],
  );

  const handleClearFilters = useCallback(() => {
    setApiConfig((oldConfig) => ({
      ...oldConfig,
      filters: defaultPaginationConfig.filters,
      page: 1,
    }));

    resetForm({
      name: '',
      max_updated: null,
      min_updated: null,
      permission: null,
    });

    updateState({
      category: 'filters',
      key: 'roles',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const cols = useMemo<ICol<IRole>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '150px',
        customColumn: ({ id, name }) => {
          return (
            <div style={{ display: 'flex' }}>
              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoRole({ id })}
              />

              {permissions.updateRole && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Papel"
                  action={() => setUpdateRole({ id })}
                />
              )}

              {permissions.deleteRole && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Papel"
                  action={() => setDeleteRole({ id, name })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [permissions]);

  const defaultPermission = useMemo(() => {
    if (!apiConfig.filters.permission) {
      return null;
    }

    return {
      permission: apiConfig.filters.permission,
      translate: translatorPermission[apiConfig.filters.permission],
    };
  }, [apiConfig.filters.permission]);

  if (rolesLoading) return <Loading loading={rolesLoading} />;

  return (
    <>
      {!!deleteRole && (
        <DeleteRoleModal
          openModal={!!deleteRole}
          closeModal={() => setDeleteRole(null)}
          role={deleteRole}
          handleDeleteData={handleDeleteRole}
        />
      )}

      {!!updateRole && (
        <UpdateRoleModal
          openModal={!!updateRole}
          closeModal={() => setUpdateRole(null)}
          role_id={updateRole.id}
          handleUpdateData={handleUpdateRole}
        />
      )}

      {!!infoRole && (
        <InfoRoleModal
          openModal={!!infoRole}
          closeModal={() => setInfoRole(null)}
          role_id={infoRole.id}
        />
      )}

      {createRole && (
        <CreateRoleModal
          openModal={createRole}
          closeModal={() => setCreateRole(false)}
          handleAdd={handleAddRole}
        />
      )}

      {rolesData && (
        <CustomTable<IRole>
          id="roles"
          cols={cols}
          data={rolesData.data}
          tableMinWidth="500px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createRole && (
                <CustomIconButton
                  action={() => setCreateRole(true)}
                  title="Cadastrar Papel"
                  type="add"
                />
              )}
            </>
          }
          sortContainer={
            <Box
              sx={{
                width: '300px',
                padding: '0.6rem',
                border: `2px solid`,
                borderColor: 'divider',
              }}
            >
              <CustomSelect
                label="Classificar por"
                onChange={(newValue) => {
                  setApiConfig((oldConfig) => ({ ...oldConfig, sort_by: newValue.value }));

                  updateState({
                    category: 'sort_by',
                    key: 'roles',
                    value: newValue.value,
                    localStorage: true,
                  });
                }}
                options={sortOptions}
                optionLabel="label"
                value={{ value: apiConfig.sort_by, label: sortTranslator[apiConfig.sort_by] }}
              />

              <CustomSelect
                label="Ordem"
                onChange={(newValue) => {
                  setApiConfig((oldConfig) => ({ ...oldConfig, order_by: newValue.value }));

                  updateState({
                    category: 'order_by',
                    key: 'roles',
                    value: newValue.value,
                    localStorage: true,
                  });
                }}
                options={orderOptions}
                optionLabel="label"
                value={{ value: apiConfig.order_by, label: orderTranslator[apiConfig.order_by] }}
              />
            </Box>
          }
          filterContainer={
            <>
              <form onSubmit={handleSubmit(handleApplyFilters)} noValidate>
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="name"
                      label="Nome"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.name}
                      errors={errors.name}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      name="permission"
                      label="Permissão"
                      margin_type="no-margin"
                      options={translatePermissions(Object.values(PermissionsUser))}
                      optionLabel="translate"
                      defaultValue={defaultPermission}
                      errors={errors.permission as any}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_updated"
                      label="Data de Atualização (Minima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_updated}
                      errors={errors.min_updated}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_updated"
                      label="Data de Atualização (Maxima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_updated}
                      errors={errors.max_updated}
                    />
                  </Grid>
                </Grid>

                <Grid container columnSpacing={2}>
                  <Grid item md={6} xs={12}>
                    <CustomButton type="submit" size="medium">
                      Aplicar Filtros
                    </CustomButton>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <CustomButton color="info" size="medium" onClick={handleClearFilters}>
                      Limpar Filtros
                    </CustomButton>
                  </Grid>
                </Grid>
              </form>
            </>
          }
          pagination={{
            currentPage: apiConfig.page,
            totalPages: rolesData.pagination.total_pages,
            totalResults: rolesData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
