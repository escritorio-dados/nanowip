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
import { IAssignment, IAssignmentFilters } from '#shared/types/backend/IAssignment';
import { ICollaborator, limitedCollaboratorsLength } from '#shared/types/backend/ICollaborator';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { DeleteAssignmentModal } from '#modules/assignments/components/DeleteAssignment';
import { InfoAssignmentModal } from '#modules/assignments/components/InfoAssignment';
import { UpdateAssignmentModal } from '#modules/assignments/components/UpdateAssignment';
import {
  filterAssignmentSchema,
  IFilterAssignmentSchema,
} from '#modules/assignments/schemas/filterAssignment.schema';

type IInfoAssignment = IAssignment & { collaboratorName: string; taskName: string };

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IAssignmentFilters> = {
  page: 1,
  sort_by: 'collaborator',
  order_by: 'ASC',
  filters: {
    collaborator: null,
    in_progress: false,
    task: '',
    local: '',
    status: 'Aberto',
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
  start_date: 'Data de Inicio',
  end_date: 'Data de Término',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListAssignment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IAssignmentFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IAssignmentFilters>({
      category: 'filters',
      key: 'assignments',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'assignments',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'assignments',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'assignments',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteAssignment, setDeleteAssignment] = useState<IDeleteModal>(null);
  const [updateAssignment, setUpdateAssignment] = useState<IUpdateModal>(null);
  const [infoAssignment, setInfoAssignment] = useState<IUpdateModal>(null);

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
    loading: assignmentsLoading,
    data: assignmentsData,
    error: assignmentsError,
    send: getAssignments,
    updateData: updateAssignmentsData,
  } = useGet<IPagingResult<IAssignment>>({
    url: '/assignments',
    lazy: true,
  });

  const {
    loading: collaboratorsLoading,
    data: collaboratorsData,
    error: collaboratorsError,
    send: getCollaborators,
  } = useGet<ICollaborator[]>({
    url: '/collaborators/limited',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterAssignmentSchema>({
    resolver: yupResolver(filterAssignmentSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getAssignments({ params: apiParams });
  }, [apiParams, getAssignments]);

  useEffect(() => {
    if (assignmentsError) {
      toast({ message: assignmentsError, severity: 'error' });

      return;
    }

    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });
    }
  }, [assignmentsError, collaboratorsError, toast]);

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
    updateTitle('Atribuições');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      updateAssignment: checkPermissions([
        [PermissionsUser.update_assignment, PermissionsUser.manage_assignment],
      ]),
      deleteAssignment: checkPermissions([
        [PermissionsUser.delete_assignment, PermissionsUser.manage_assignment],
      ]),
      readValueChain: checkPermissions([
        [PermissionsUser.read_value_chain, PermissionsUser.manage_value_chain],
        [PermissionsUser.read_task, PermissionsUser.manage_task],
      ]),
    };
  }, [checkPermissions]);

  const handleApplyFilters = useCallback(
    (formData: IFilterAssignmentSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'assignments',
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
      key: 'assignments',
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
    if (!assignmentsData) {
      return [];
    }

    return assignmentsData.data.map((assignment) => ({
      ...assignment,
      collaboratorName: assignment.collaborator.name,
      taskName: assignment.path.task.name,
    }));
  }, [assignmentsData]);

  const cols = useMemo<ICol<IInfoAssignment>[]>(() => {
    return [
      { key: 'taskName', header: 'Tarefa', minWidth: '200px' },
      { key: 'collaboratorName', header: 'Colaborador', minWidth: '200px' },
      {
        header: 'Local',
        maxWidth: '400px',
        customColumn: ({ path }) => {
          const pathString = Object.values(path)
            .slice(1, 4)
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
                <Box>
                  {Object.values(path)
                    .reverse()
                    .map(({ id, name, entity }) => (
                      <Box key={id} sx={{ display: 'flex' }}>
                        <Typography
                          sx={(theme) => ({
                            color: theme.palette.primary.main,
                            fontSize: '0.85rem',
                          })}
                        >
                          {entity}:
                        </Typography>

                        <Typography sx={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                          {name}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              }
            >
              <TextEllipsis fontSize="0.875rem">{pathString}</TextEllipsis>
            </Tooltip>
          );
        },
      },
      {
        header: 'Opções',
        maxWidth: '200px',
        customColumn: ({ id, path, collaboratorName }) => {
          return (
            <div style={{ display: 'flex', position: 'relative' }}>
              {permissions.readValueChain && (
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
                action={() => setInfoAssignment({ id })}
              />

              {permissions.updateAssignment && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Atribuição"
                  action={() => setUpdateAssignment({ id })}
                />
              )}

              {permissions.deleteAssignment && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Atribuição"
                  action={() =>
                    setDeleteAssignment({ id, name: `${collaboratorName} - ${path.task.name}` })
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
    permissions.deleteAssignment,
    permissions.readValueChain,
    permissions.updateAssignment,
  ]);

  if (assignmentsLoading) return <Loading loading={assignmentsLoading} />;

  return (
    <>
      {!!deleteAssignment && (
        <DeleteAssignmentModal
          openModal={!!deleteAssignment}
          closeModal={() => setDeleteAssignment(null)}
          assignment={deleteAssignment}
          handleDeleteData={(id) =>
            updateAssignmentsData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateAssignment && (
        <UpdateAssignmentModal
          openModal={!!updateAssignment}
          closeModal={() => setUpdateAssignment(null)}
          assignment_id={updateAssignment.id}
          handleUpdateData={(id, newData) =>
            updateAssignmentsData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoAssignment && (
        <InfoAssignmentModal
          openModal={!!infoAssignment}
          closeModal={() => setInfoAssignment(null)}
          assignment_id={infoAssignment.id}
        />
      )}

      {assignmentsData && (
        <CustomTable<IInfoAssignment>
          id="assignments"
          cols={cols}
          data={data}
          goBackUrl={getBackUrl('assignments')}
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
                    key: 'assignments',
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
                    key: 'assignments',
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
            totalPages: assignmentsData.pagination.total_pages,
            totalResults: assignmentsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
