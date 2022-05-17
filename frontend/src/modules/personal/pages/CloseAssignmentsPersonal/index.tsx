import { yupResolver } from '@hookform/resolvers/yup';
import { LockOpen } from '@mui/icons-material';
import { Box, Grid, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IAssignment, ICloseAssignmentsPersonalFilters } from '#shared/types/backend/IAssignment';
import { IPathObject } from '#shared/types/backend/shared/ICommonApi';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { ConfirmChangeStatusTaskModal } from '#modules/personal/components/ConfirmChangeStatusTask';
import {
  filterCloseAssignmentSchema,
  IFilterCloseAssignmentSchema,
} from '#modules/personal/schema/filterCloseAssignment.schema';

type IReopenAssignment = { id: string; path: IPathObject } | null;

type IInfoAssignment = {
  id: string;
  path: IPathObject;
  endDate: string;
};

const defaultPaginationConfig: IPaginationConfig<ICloseAssignmentsPersonalFilters> = {
  page: 1,
  sort_by: 'end_date',
  order_by: 'DESC',
  filters: {
    task: '',
    local: '',
    min_end: null,
    max_end: null,
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  task: 'Tarefa',
  product: 'Produto',
  end_date: 'Fim',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListCloseAssignmentsPersonal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICloseAssignmentsPersonalFilters>>(
    () => {
      const pageParam = searchParams.get('page');
      const sortByParam = searchParams.get('sort_by');
      const orderByParam = searchParams.get('order_by');

      const filtersParam = searchParams.get('filters');

      let filters = getState<ICloseAssignmentsPersonalFilters>({
        category: 'filters',
        key: 'close_assignments_personal',
        defaultValue: defaultPaginationConfig.filters,
      });

      if (filtersParam) {
        filters = JSON.parse(filtersParam);

        updateState({
          category: 'filters',
          key: 'close_assignments_personal',
          value: filters,
          localStorage: true,
        });
      }

      const sort_by =
        sortByParam ||
        getState<string>({
          category: 'sort_by',
          key: 'close_assignments_personal',
          defaultValue: defaultPaginationConfig.sort_by,
        });

      const order_by =
        orderByParam ||
        getState<string>({
          category: 'order_by',
          key: 'close_assignments_personal',
          defaultValue: defaultPaginationConfig.order_by,
        });

      return {
        page: Number(pageParam) || defaultPaginationConfig.page,
        sort_by,
        order_by,
        filters,
      };
    },
  );
  const [confirmReopen, setConfirmReopen] = useState<IReopenAssignment>(null);

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
    error: assignmentsError,
    loading: assignmentsLoading,
    data: assignmentsData,
    send: getAssignments,
  } = useGet<IPagingResult<IAssignment>>({ url: '/assignments/personal/closed' });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterCloseAssignmentSchema>({
    resolver: yupResolver(filterCloseAssignmentSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getAssignments({ params: apiParams });
  }, [apiParams, getAssignments]);

  useEffect(() => {
    if (assignmentsError) {
      toast({ message: assignmentsError, severity: 'error' });
    }
  }, [assignmentsError, toast]);

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
    updateTitle('Reabrir Tarefa');
  }, [updateTitle]);

  const handleApplyFilters = useCallback(
    (formData: IFilterCloseAssignmentSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'close_assignments_personal',
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
      key: 'close_assignments_personal',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const data = useMemo(() => {
    if (!assignmentsData) {
      return [];
    }

    return assignmentsData.data.map<IInfoAssignment>((assignment) => {
      return {
        ...assignment,
        endDate: parseDateApi(assignment.endDate, 'dd/MM/yyyy (HH:mm)', '-'),
      };
    });
  }, [assignmentsData]);

  const cols = useMemo<ICol<IInfoAssignment>[]>(() => {
    return [
      {
        header: 'Tarefa',
        minWidth: '250px',
        customColumn: ({ path }) => {
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
              }
            >
              <Box>
                <TextEllipsis
                  fontSize="0.875rem"
                  sx={(theme) => ({ color: theme.palette.primary.main })}
                >
                  {path.subproduct ? `${path.subproduct?.name} |` : ''}
                  {path.product.name}
                </TextEllipsis>

                <TextEllipsis fontSize="0.875rem">
                  {path.task.name} | {path.valueChain.name}
                </TextEllipsis>
              </Box>
            </Tooltip>
          );
        },
      },
      { key: 'endDate', header: 'Fim', minWidth: '170x', maxWidth: '170x' },
      {
        header: 'Opções',
        maxWidth: '90px',
        customColumn: ({ id, path }) => {
          return (
            <Box sx={{ display: 'flex', position: 'relative' }}>
              <CustomIconButton
                type="custom"
                CustomIcon={<LockOpen fontSize="small" color="primary" />}
                title="Reabrir Tarefa"
                action={() => setConfirmReopen({ id, path })}
              />
            </Box>
          );
        },
      },
    ];
  }, []);

  if (assignmentsLoading) return <Loading loading={assignmentsLoading} />;

  return (
    <>
      {!!confirmReopen && (
        <ConfirmChangeStatusTaskModal
          openModal={!!confirmReopen}
          closeModal={() => setConfirmReopen(null)}
          reloadList={() => getAssignments({ params: apiParams })}
          assignment={confirmReopen}
          status="Aberto"
        />
      )}

      {assignmentsData && (
        <CustomTable<IInfoAssignment>
          id="close_assignments_personal"
          cols={cols}
          data={data}
          tableMinWidth="600px"
          activeFilters={activeFiltersNumber}
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
            totalPages: assignmentsData.pagination.total_pages,
            totalResults: assignmentsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
