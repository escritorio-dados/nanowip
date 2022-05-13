import { yupResolver } from '@hookform/resolvers/yup';
import { ListAlt } from '@mui/icons-material';
import { Avatar, Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomPopover } from '#shared/components/CustomPopover';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICollaborator, ICollaboratorFilters } from '#shared/types/backend/ICollaborator';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateCollaboratorModal } from '#modules/collaborators/components/CreateCollaborator';
import { DeleteCollaboratorModal } from '#modules/collaborators/components/DeleteCollaborator';
import { InfoCollaboratorModal } from '#modules/collaborators/components/InfoCollaborator';
import { UpdateCollaboratorModal } from '#modules/collaborators/components/UpdateCollaborator';
import {
  filterCollaboratorSchema,
  IFilterCollaboratorSchema,
} from '#modules/collaborators/schema/filterCollaborator.schema';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<ICollaboratorFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: {
    name: '',
    jobTitle: '',
    type: null,
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  type: 'Tipo',
  jobTitle: 'Cargo',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListCollaborator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICollaboratorFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<ICollaboratorFilters>({
      category: 'filters',
      key: 'collaborators',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'collaborators',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'collaborators',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'collaborators',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteCollaborator, setDeleteCollaborator] = useState<IDeleteModal>(null);
  const [updateCollaborator, setUpdateCollaborator] = useState<IUpdateModal>(null);
  const [createCollaborator, setCreateCollaborator] = useState(false);
  const [infoCollaborator, setInfoCollaborator] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setBackUrl } = useGoBackUrl();
  const { toast } = useToast();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
    };
  }, [apiConfig]);

  const {
    loading: collaboratorsLoading,
    data: collaboratorsData,
    error: collaboratorsError,
    send: getCollaborators,
    updateData: updateCollaboratorsData,
  } = useGet<IPagingResult<ICollaborator>>({
    url: '/collaborators',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterCollaboratorSchema>({
    resolver: yupResolver(filterCollaboratorSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getCollaborators({ params: apiParams });
  }, [apiParams, getCollaborators]);

  useEffect(() => {
    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });
    }
  }, [collaboratorsError, toast]);

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
    updateTitle('Colaboradores');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createCollaborator: checkPermissions([
        [PermissionsUser.create_collaborator, PermissionsUser.manage_collaborator],
      ]),
      updateCollaborator: checkPermissions([
        [PermissionsUser.update_collaborator, PermissionsUser.manage_collaborator],
      ]),
      deleteCollaborator: checkPermissions([
        [PermissionsUser.delete_collaborator, PermissionsUser.manage_collaborator],
      ]),
      readAssignments: checkPermissions([
        [PermissionsUser.read_assignment, PermissionsUser.manage_assignment],
      ]),
      readTrackers: checkPermissions([
        [PermissionsUser.read_tracker, PermissionsUser.manage_tracker],
      ]),
      readCollaboratorsStatus: checkPermissions([
        [PermissionsUser.read_collaborator_status, PermissionsUser.manage_collaborator_status],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleApplyFilters = useCallback(
    (formData: IFilterCollaboratorSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'collaborators',
        value: formData,
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

    resetForm(defaultPaginationConfig.filters);

    updateState({
      category: 'filters',
      key: 'collaborators',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const handleNavigateAssignments = useCallback(
    (id: string, name: string) => {
      const search = { filters: JSON.stringify({ collaborator: { id, name } }) };

      setBackUrl('assignments', location);

      navigate({
        pathname: '/assignments',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const handleNavigateTrackers = useCallback(
    (id: string, name: string) => {
      const search = { filters: JSON.stringify({ collaborator: { id, name } }) };

      setBackUrl('trackers', location);

      navigate({
        pathname: '/trackers',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const handleNavigateStatus = useCallback(
    (id: string, name: string) => {
      const search = { filters: JSON.stringify({ collaborator: { id, name } }) };

      setBackUrl('collaborators_status', location);

      navigate({
        pathname: '/collaborators_status',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<ICollaborator>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      { key: 'type', header: 'Tipo', minWidth: '200px' },
      { key: 'jobTitle', header: 'Cargo', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '200px',
        customColumn: ({ id, name }) => {
          return (
            <div style={{ display: 'flex', position: 'relative' }}>
              <CustomPopover icon={<ListAlt fontSize="small" />} help="Ir Para">
                <>
                  {permissions.readAssignments && (
                    <CustomIconButton
                      type="custom"
                      CustomIcon={
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: 'text.primary',
                          }}
                        >
                          A
                        </Avatar>
                      }
                      title="Atribuições"
                      action={() => handleNavigateAssignments(id, name)}
                    />
                  )}

                  {permissions.readTrackers && (
                    <CustomIconButton
                      type="custom"
                      CustomIcon={
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: 'text.primary',
                          }}
                        >
                          T
                        </Avatar>
                      }
                      title="Trackers"
                      action={() => handleNavigateTrackers(id, name)}
                    />
                  )}

                  {permissions.readCollaboratorsStatus && (
                    <CustomIconButton
                      type="custom"
                      CustomIcon={
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: 'text.primary',
                          }}
                        >
                          S
                        </Avatar>
                      }
                      title="Status do colaborador"
                      action={() => handleNavigateStatus(id, name)}
                    />
                  )}
                </>
              </CustomPopover>

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoCollaborator({ id })}
              />

              {permissions.updateCollaborator && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Colaborador"
                  action={() => setUpdateCollaborator({ id })}
                />
              )}

              {permissions.deleteCollaborator && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Colaborador"
                  action={() => setDeleteCollaborator({ id, name })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [
    handleNavigateAssignments,
    handleNavigateStatus,
    handleNavigateTrackers,
    permissions.deleteCollaborator,
    permissions.readAssignments,
    permissions.readCollaboratorsStatus,
    permissions.readTrackers,
    permissions.updateCollaborator,
  ]);

  if (collaboratorsLoading) return <Loading loading={collaboratorsLoading} />;

  return (
    <>
      {createCollaborator && (
        <CreateCollaboratorModal
          openModal={createCollaborator}
          closeModal={() => setCreateCollaborator(false)}
          handleAdd={(newData) =>
            updateCollaboratorsData((current) => handleAddItem({ newData, current }))
          }
        />
      )}

      {!!deleteCollaborator && (
        <DeleteCollaboratorModal
          openModal={!!deleteCollaborator}
          closeModal={() => setDeleteCollaborator(null)}
          collaborator={deleteCollaborator}
          handleDeleteData={(id) =>
            updateCollaboratorsData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateCollaborator && (
        <UpdateCollaboratorModal
          openModal={!!updateCollaborator}
          closeModal={() => setUpdateCollaborator(null)}
          collaborator_id={updateCollaborator.id}
          handleUpdateData={(id, newData) =>
            updateCollaboratorsData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoCollaborator && (
        <InfoCollaboratorModal
          openModal={!!infoCollaborator}
          closeModal={() => setInfoCollaborator(null)}
          collaborator_id={infoCollaborator.id}
        />
      )}

      {collaboratorsData && (
        <CustomTable<ICollaborator>
          id="collaborators"
          cols={cols}
          data={collaboratorsData.data}
          tableMinWidth="600px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createCollaborator && (
                <CustomIconButton
                  action={() => setCreateCollaborator(true)}
                  title="Cadastrar Colaborador"
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
                    key: 'collaborators',
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
                    key: 'collaborators',
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
                    <FormTextField
                      control={control}
                      name="jobTitle"
                      label="Cargo"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.jobTitle}
                      errors={errors.jobTitle}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      name="type"
                      label="Tipo"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.type}
                      options={['Interno', 'Externo']}
                      errors={errors.type}
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
            totalPages: collaboratorsData.pagination.total_pages,
            totalResults: collaboratorsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
