import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormCheckbox } from '#shared/components/form/FormCheck';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { ITracker, ITrackerFiltersPersonal } from '#shared/types/backend/ITracker';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { getDurationDates, parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateTrackerPersonalModal } from '#modules/personal/components/CreateTrackerPersonal';
import { UpdateTrackerPersonalModal } from '#modules/personal/components/UpdateTrackerPersonal';
import {
  filterTrackerPersonalSchema,
  IFilterTrackerPersonalSchema,
} from '#modules/personal/schema/filterTrackerPersonal.schema';
import { DeleteTrackerModal } from '#modules/trackers/components/DeleteTracker';
import { InfoTrackerModal } from '#modules/trackers/components/InfoTracker';

type IInfoTracker = Omit<ITracker, 'start' | 'end' | 'duration'> & {
  duration: string;
  start: string;
};

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<ITrackerFiltersPersonal> = {
  page: 1,
  sort_by: 'start',
  order_by: 'DESC',
  filters: {
    in_progress: false,
    task: '',
    local: '',
    reason: '',
    status: null,
    type: null,
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
  product: 'Produto',
  reason: 'Motivo',
  start: 'Inicio',
  end: 'Fim',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListTrackerPersonal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ITrackerFiltersPersonal>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<ITrackerFiltersPersonal>({
      category: 'filters',
      key: 'trackers_personal',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'trackers_personal',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'trackers_personal',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'trackers_personal',
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

  const { toast } = useToast();
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
    loading: trackersLoading,
    data: trackersData,
    error: trackersError,
    send: getTrackers,
  } = useGet<IPagingResult<ITracker>>({
    url: '/trackers/personal',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterTrackerPersonalSchema>({
    resolver: yupResolver(filterTrackerPersonalSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getTrackers({ params: apiParams });
  }, [apiParams, getTrackers]);

  useEffect(() => {
    if (trackersError) {
      toast({ message: trackersError, severity: 'error' });
    }
  }, [trackersError, toast]);

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
    updateTitle('Meus Trackers');
  }, [updateTitle]);

  const handleApplyFilters = useCallback(
    (formData: IFilterTrackerPersonalSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'trackers_personal',
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
      key: 'trackers_personal',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const data = useMemo(() => {
    if (!trackersData) {
      return [];
    }

    return trackersData.data.map<IInfoTracker>((tracker) => {
      return {
        ...tracker,
        duration: getDurationDates(tracker.start, tracker.end),
        start: parseDateApi(tracker.start, 'dd/MM/yyyy (HH:mm)', '-'),
        end: parseDateApi(tracker.end, 'dd/MM/yyyy (HH:mm)', '-'),
      };
    });
  }, [trackersData]);

  const cols = useMemo<ICol<IInfoTracker>[]>(() => {
    return [
      {
        header: 'Tarefa',
        minWidth: '250px',
        maxWidth: '400px',
        customColumn: ({ path, reason }) => {
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
              {reason ? (
                <TextEllipsis fontSize="0.875rem">{`[SV] ${reason}`}</TextEllipsis>
              ) : (
                <Box>
                  <TextEllipsis
                    fontSize="0.875rem"
                    sx={(theme) => ({ color: theme.palette.primary.main })}
                  >
                    {path.subproduct?.name ? `${path.subproduct?.name} | ` : ''}
                    {path.product.name}
                  </TextEllipsis>

                  <TextEllipsis fontSize="0.875rem">
                    {' '}
                    {path.task.name} | {path.valueChain.name}
                  </TextEllipsis>
                </Box>
              )}
            </Tooltip>
          );
        },
      },
      { key: 'start', header: 'Inicio', minWidth: '170x', maxWidth: '170x' },
      { key: 'end', header: 'Fim', minWidth: '170x', maxWidth: '170x' },
      { key: 'duration', header: 'Duração', minWidth: '150px', maxWidth: '150px' },
      {
        header: 'Opções',
        maxWidth: '170px',
        customColumn: ({ id, path, reason }) => {
          return (
            <Box sx={{ display: 'flex', position: 'relative' }}>
              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoTracker({ id })}
              />

              <CustomIconButton
                type="edit"
                size="small"
                title="Editar Tracker"
                action={() => setUpdateTracker({ id })}
              />

              <CustomIconButton
                type="delete"
                size="small"
                title="Deletar Tracker"
                action={() =>
                  setDeleteTracker({
                    id,
                    name: `${path?.task.name || reason}`,
                  })
                }
              />
            </Box>
          );
        },
      },
    ];
  }, []);

  if (trackersLoading) return <Loading loading={trackersLoading} />;

  return (
    <>
      {createTracker && (
        <CreateTrackerPersonalModal
          openModal={createTracker}
          closeModal={() => setCreateTracker(false)}
          reloadList={() => getTrackers({ params: apiParams })}
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
        <UpdateTrackerPersonalModal
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
          id="trackers_personal"
          cols={cols}
          data={data}
          tableMinWidth="1000px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              <CustomIconButton
                type="add"
                title="Cadastrar Tracker"
                action={() => setCreateTracker(true)}
              />
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
