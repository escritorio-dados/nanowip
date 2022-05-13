import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FieldError, useForm } from 'react-hook-form';
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
import { DEFAULT_USER_ID, IUser, IUserFilters } from '#shared/types/backend/IUser';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';
import { translatePermissions, translatorPermission } from '#shared/utils/translatePermissions';

import { CreateUserModal } from '#modules/users/components/CreateUser';
import { DeleteUserModal } from '#modules/users/components/DeleteUser';
import { InfoUserModal } from '#modules/users/components/InfoUser';
import { UpdateUserModal } from '#modules/users/components/UpdateUser';
import { filterUserSchema, IFilterUserSchema } from '#modules/users/schema/filterUser.schema';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IUserFilters> = {
  page: 1,
  sort_by: 'updated_at',
  order_by: 'DESC',
  filters: {
    name: '',
    email: '',
    permission: '',
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  email: 'Email',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListUser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IUserFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IUserFilters>({
      category: 'filters',
      key: 'users',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'users',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'users',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'users',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteUser, setDeleteUser] = useState<IDeleteModal>(null);
  const [infoUser, setInfoUser] = useState<IUpdateModal>(null);
  const [updateUser, setUpdateUser] = useState<IUpdateModal>(null);
  const [createUser, setCreateUser] = useState(false);

  const { checkPermissions, user: userLogged } = useAuth();
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
  } = useForm<IFilterUserSchema>({
    resolver: yupResolver(filterUserSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const {
    loading: usersLoading,
    data: usersData,
    error: usersError,
    send: getUsers,
    updateData: updateUsersData,
  } = useGet<IPagingResult<IUser>>({
    url: '/users',
    lazy: true,
  });

  useEffect(() => {
    getUsers({ params: apiParams });
  }, [apiParams, getUsers]);

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
    if (usersError) {
      toast({ message: usersError, severity: 'error' });
    }
  }, [usersError, toast]);

  useEffect(() => {
    updateTitle('Usuarios');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      updateUser: checkPermissions([[PermissionsUser.update_user, PermissionsUser.manage_user]]),
      deleteUser: checkPermissions([[PermissionsUser.delete_user, PermissionsUser.manage_user]]),
      createUser: checkPermissions([[PermissionsUser.create_user, PermissionsUser.manage_user]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleAddUser = useCallback(
    (newUser: IUser) => {
      updateUsersData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: [newUser, ...current.data],
        };
      });
    },
    [updateUsersData],
  );

  const handleUpdateUser = useCallback(
    (id: string, newUser: IUser) => {
      updateUsersData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: current.data.map((user) => (user.id === id ? newUser : user)),
        };
      });
    },
    [updateUsersData],
  );

  const handleDeleteUser = useCallback(
    (id: string) => {
      updateUsersData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: current.data.filter((user) => user.id !== id),
        };
      });
    },
    [updateUsersData],
  );

  const handleApplyFilters = useCallback(
    (formData: IFilterUserSchema) => {
      const filtersValue = { ...formData, permission: formData.permission?.permission || '' };

      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: filtersValue,
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'users',
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
      email: '',
      name: '',
      max_updated: null,
      min_updated: null,
      permission: null,
    });

    updateState({
      category: 'filters',
      key: 'users',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const cols = useMemo<ICol<IUser>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      { key: 'email', header: 'Email', minWidth: '300px' },
      {
        header: 'Opções',
        maxWidth: '150px',
        customColumn: ({ id, name }) => {
          const changeRootOnlyWithRoot = !(id === DEFAULT_USER_ID && id !== userLogged.id);

          const rootDontDelete = id !== DEFAULT_USER_ID;

          return (
            <div style={{ display: 'flex' }}>
              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoUser({ id })}
              />

              {permissions.updateUser && changeRootOnlyWithRoot && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Usuario"
                  action={() => setUpdateUser({ id })}
                />
              )}

              {permissions.deleteUser && rootDontDelete && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Usuario"
                  action={() => setDeleteUser({ id, name })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [permissions, userLogged.id]);

  const defaultPermission = useMemo(() => {
    if (!apiConfig.filters.permission) {
      return null;
    }

    return {
      permission: apiConfig.filters.permission,
      translate: translatorPermission[apiConfig.filters.permission],
    };
  }, [apiConfig.filters.permission]);

  if (usersLoading) return <Loading loading={usersLoading} />;

  return (
    <>
      {!!deleteUser && (
        <DeleteUserModal
          openModal={!!deleteUser}
          closeModal={() => setDeleteUser(null)}
          user={deleteUser}
          handleDeleteData={handleDeleteUser}
        />
      )}

      {!!updateUser && (
        <UpdateUserModal
          openModal={!!updateUser}
          closeModal={() => setUpdateUser(null)}
          user_id={updateUser.id}
          handleUpdateData={handleUpdateUser}
        />
      )}

      {!!infoUser && (
        <InfoUserModal
          openModal={!!infoUser}
          closeModal={() => setInfoUser(null)}
          user_id={infoUser.id}
        />
      )}

      {createUser && (
        <CreateUserModal
          openModal={createUser}
          closeModal={() => setCreateUser(false)}
          handleAdd={handleAddUser}
        />
      )}

      {usersData && (
        <CustomTable<IUser>
          id="users"
          cols={cols}
          data={usersData.data}
          tableMinWidth="700px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createUser && (
                <CustomIconButton
                  action={() => setCreateUser(true)}
                  title="Cadastrar Usuario"
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
                    key: 'users',
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
                    key: 'users',
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
                  <Grid item lg={4} sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="name"
                      label="Nome"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.name}
                      errors={errors.name}
                    />
                  </Grid>

                  <Grid item lg={4} sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="email"
                      label="E-mail"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.email}
                      errors={errors.email}
                    />
                  </Grid>

                  <Grid item lg={4} sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      name="permission"
                      label="Permissão"
                      margin_type="no-margin"
                      options={translatePermissions(Object.values(PermissionsUser))}
                      optionLabel="translate"
                      optionValue="permission"
                      defaultValue={defaultPermission}
                      errors={errors.permission as FieldError}
                    />
                  </Grid>

                  <Grid item lg={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_updated"
                      label="Data de Atualização (Minima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_updated}
                      errors={errors.min_updated}
                    />
                  </Grid>

                  <Grid item lg={4} sm={6} xs={12}>
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
            totalPages: usersData.pagination.total_pages,
            totalResults: usersData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
