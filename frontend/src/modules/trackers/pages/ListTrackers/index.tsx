import { yupResolver } from '@hookform/resolvers/yup';
import { ListAlt } from '@mui/icons-material';
import { Box, Grid, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormCheckbox } from '#shared/components/form/FormCheck';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { ICollaborator, limitedCollaboratorsLength } from '#shared/types/backend/ICollaborator';
import { ITracker, ITrackerFilters } from '#shared/types/backend/ITracker';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { getDurationDates, parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateTrackerModal } from '#modules/trackers/components/CreateTracker';
import { DeleteTrackerModal } from '#modules/trackers/components/DeleteTracker';
import { InfoTrackerModal } from '#modules/trackers/components/InfoTracker';
import { UpdateTrackerModal } from '#modules/trackers/components/UpdateTracker';
import {
  filterTrackerSchema,
  IFilterTrackerSchema,
} from '#modules/trackers/schemas/filterTracker.schema';

type IInfoTracker = Omit<ITracker, 'start' | 'end' | 'duration'> & {
  collaboratorName: string;
  duration: string;
  start: string;
};

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<ITrackerFilters> = {
  page: 1,
  sort_by: 'collaborator',
  order_by: 'ASC',
  filters: {
    collaborator: null,
    in_progress: false,
    task: '',
    local: '',
    reason: '',
    status: 'Aberto',
    type: 'Vinculado',
    max_start: null,
    min_start: null,
    min_end: null,
    max_end: null,
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  task: 'Tarefa',
  collaborator: 'Colaborador',
  reason: 'Motivo',
  start: 'Inicio',
  end: 'Fim',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListTracker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ITrackerFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<ITrackerFilters>({
      category: 'filters',
      key: 'trackers',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'trackers',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'trackers',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'trackers',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [createTracker, setCreateTracker] = useState<boolean>(false);
  const [deleteTracker, setDeleteTracker] = useState<IDeleteModal>(null);
  const [updateTracker, setUpdateTracker] = useState<IUpdateModal>(null);
  const [infoTracker, setInfoTracker] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setBackUrl, getBackUrl } = useGoBackUrl();
  const { toast } = useToast();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      collaborator_id: apiConfig.filters.collaborator?.id,
    };
  }, [apiConfig]);

  const {
    loading: trackersLoading,
    data: trackersData,
    error: trackersError,
    send: getTrackers,
  } = useGet<IPagingResult<ITracker>>({
    url: '/trackers',
    lazy: true,
  });

  const {
    loading: collaboratorsLoading,
    data: collaboratorsData,
    error: collaboratorsError,
    send: getCollaborators,
  } = useGet<ICollaborator[]>({
    url: '/collaborators/limited/trackers',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterTrackerSchema>({
    resolver: yupResolver(filterTrackerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getTrackers({ params: apiParams });
  }, [apiParams, getTrackers]);

  useEffect(() => {
    if (trackersError) {
      toast({ message: trackersError, severity: 'error' });

      return;
    }

    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });
    }
  }, [trackersError, collaboratorsError, toast]);

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
    updateTitle('Trackers');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createTracker: checkPermissions([
        [PermissionsUser.create_tracker, PermissionsUser.manage_tracker],
      ]),
      updateTracker: checkPermissions([
        [PermissionsUser.update_tracker, PermissionsUser.manage_tracker],
      ]),
      deleteTracker: checkPermissions([
        [PermissionsUser.delete_tracker, PermissionsUser.manage_tracker],
      ]),
      readValueChain: checkPermissions([
        [PermissionsUser.read_value_chain, PermissionsUser.manage_value_chain],
        [PermissionsUser.read_task, PermissionsUser.manage_task],
      ]),
    };
  }, [checkPermissions]);

  const handleApplyFilters = useCallback(
    (formData: IFilterTrackerSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'trackers',
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
      key: 'trackers',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const handleNavigateValueChain = useCallback(
    (id: string) => {
      setBackUrl('tasks', location);

      navigate({
        pathname: `/tasks/graph/${id}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const collaboratorsOptions = useMemo(() => {
    const options = !collaboratorsData ? [] : collaboratorsData;

    if (apiConfig.filters.collaborator) {
      const filter = options.find(
        (collaborator) => collaborator.id === apiConfig.filters.collaborator!.id,
      );

      if (!filter) {
        options.push(apiConfig.filters.collaborator as any);
      }
    }

    return options;
  }, [apiConfig.filters.collaborator, collaboratorsData]);

  const data = useMemo(() => {
    if (!trackersData) {
      return [];
    }

    return trackersData.data.map<IInfoTracker>((tracker) => {
      return {
        ...tracker,
        collaboratorName: tracker.collaborator.name,
        duration: getDurationDates(tracker.start, tracker.end),
        start: parseDateApi(tracker.start, 'dd/MM/yyyy (HH:mm)', '-'),
      };
    });
  }, [trackersData]);

  const cols = useMemo<ICol<IInfoTracker>[]>(() => {
    return [
      { key: 'collaboratorName', header: 'Colaborador', minWidth: '170px' },
      {
        header: 'Tarefa',
        maxWidth: '400px',
        customColumn: ({ path, reason }) => {
          const pathString = reason
            ? `[SV] ${reason}`
            : Object.values(path)
                .slice(0, 4)
                .map(({ name }) => name)
                .join(' | ');

          return (
            <Tooltip
              componentsProps={{
                tooltip: {
                  sx: (theme) => ({
                    backgroundColor: theme.palette.background.default,
                    border: `2px solid ${theme.palette.divider}`,
                  }),
                },
              }}
              title={
                reason || (
                  <Box>
                    {Object.values(path)
                      .reverse()
                      .map(({ id, name, entity }) => (
                        <Box key={id} sx={{ display: 'flex' }}>
                          <Typography sx={(theme) => ({ color: theme.palette.primary.main })}>
                            {entity}:
                          </Typography>

                          <Typography sx={{ marginLeft: '0.5rem' }}>{name}</Typography>
                        </Box>
                      ))}
                  </Box>
                )
              }
            >
              <TextEllipsis fontSize="0.875rem">{pathString}</TextEllipsis>
            </Tooltip>
          );
        },
      },
      { key: 'start', header: 'Inicio', maxWidth: '170x' },
      { key: 'duration', header: 'Duração', maxWidth: '150px' },
      {
        header: 'Opções',
        maxWidth: '200px',
        customColumn: ({ id, path, collaboratorName, reason }) => {
          return (
            <div style={{ display: 'flex', position: 'relative' }}>
              {path && permissions.readValueChain && (
                <CustomIconButton
                  type="custom"
                  CustomIcon={<ListAlt fontSize="small" />}
                  title="Ir para Cadeia de Valor"
                  action={() => handleNavigateValueChain(path.valueChain.id)}
                />
              )}

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoTracker({ id })}
              />

              {permissions.updateTracker && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Tracker"
                  action={() => setUpdateTracker({ id })}
                />
              )}

              {permissions.deleteTracker && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Tracker"
                  action={() =>
                    setDeleteTracker({
                      id,
                      name: `${collaboratorName} - ${path?.task.name || reason}`,
                    })
                  }
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [
    handleNavigateValueChain,
    permissions.deleteTracker,
    permissions.readValueChain,
    permissions.updateTracker,
  ]);

  if (trackersLoading) return <Loading loading={trackersLoading} />;

  return (
    <>
      {createTracker && (
        <CreateTrackerModal
          openModal={createTracker}
          closeModal={() => setCreateTracker(false)}
          reloadList={() => getTrackers({ params: apiParams })}
          defaultCollaborator={apiConfig.filters.collaborator}
        />
      )}

      {!!deleteTracker && (
        <DeleteTrackerModal
          openModal={!!deleteTracker}
          closeModal={() => setDeleteTracker(null)}
          tracker={deleteTracker}
          reloadList={() => getTrackers({ params: apiParams })}
        />
      )}

      {!!updateTracker && (
        <UpdateTrackerModal
          openModal={!!updateTracker}
          closeModal={() => setUpdateTracker(null)}
          tracker_id={updateTracker.id}
          reloadList={() => getTrackers({ params: apiParams })}
        />
      )}

      {!!infoTracker && (
        <InfoTrackerModal
          openModal={!!infoTracker}
          closeModal={() => setInfoTracker(null)}
          tracker_id={infoTracker.id}
        />
      )}

      {trackersData && (
        <CustomTable<IInfoTracker>
          id="trackers"
          cols={cols}
          data={data}
          goBackUrl={getBackUrl('trackers')}
          tableMinWidth="600px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createTracker && (
                <CustomIconButton
                  type="add"
                  title="Cadastrar Tracker"
                  action={() => setCreateTracker(true)}
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
                    key: 'trackers',
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
                    key: 'trackers',
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
                      name="task"
                      label="Tarefa"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.task}
                      errors={errors.task}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="local"
                      label="Local"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.local}
                      errors={errors.local}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="reason"
                      label="Motivo"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.reason}
                      errors={errors.reason}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="collaborator"
                      label="Colaborador"
                      options={collaboratorsOptions}
                      defaultValue={apiConfig.filters.collaborator}
                      limitFilter={limitedCollaboratorsLength}
                      optionLabel="name"
                      optionValue="id"
                      filterField="name"
                      errors={errors.collaborator as any}
                      loading={collaboratorsLoading}
                      handleOpen={() => getCollaborators()}
                      handleFilter={(params) => getCollaborators(params)}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      name="status"
                      label="Status"
                      options={['Aberto', 'Fechado']}
                      defaultValue={apiConfig.filters.status}
                      errors={errors.status}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      name="type"
                      label="Tipo"
                      options={['Vinculado', 'Solto']}
                      defaultValue={apiConfig.filters.type}
                      errors={errors.type}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_start"
                      label="Data de Inicio (Minima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_start}
                      errors={errors.min_start}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_start"
                      label="Data de Inicio (Maxima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_start}
                      errors={errors.max_start}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_end"
                      label="Data de Término (Minima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_end}
                      errors={errors.min_end}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_end"
                      label="Data de Término (Maxima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_end}
                      errors={errors.max_end}
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

                  <Grid item sm={6} xs={12}>
                    <FormCheckbox
                      control={control}
                      name="in_progress"
                      label="Em Andamento Agora"
                      defaultValue={apiConfig.filters.in_progress}
                      margin_type="no-margin"
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
            totalPages: trackersData.pagination.total_pages,
            totalResults: trackersData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}