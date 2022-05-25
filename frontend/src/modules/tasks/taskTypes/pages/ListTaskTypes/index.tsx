import { yupResolver } from '@hookform/resolvers/yup';
import { ListAlt } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ITaskType, ITaskTypeFilters } from '#shared/types/backend/ITaskType';
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

import { CreateTaskTypeModal } from '#modules/tasks/taskTypes/components/CreateTaskType';
import { DeleteTaskTypeModal } from '#modules/tasks/taskTypes/components/DeleteTaskType';
import { InfoTaskTypeModal } from '#modules/tasks/taskTypes/components/InfoTaskType';
import { UpdateTaskTypeModal } from '#modules/tasks/taskTypes/components/UpdateTaskType';
import {
  filterTaskTypeSchema,
  IFilterTaskTypeSchema,
} from '#modules/tasks/taskTypes/schema/filterTaskType.schema';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<ITaskTypeFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: {
    name: '',
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

export function ListTaskType() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ITaskTypeFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<ITaskTypeFilters>({
      category: 'filters',
      key: 'task_types',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'task_types',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'task_types',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'task_types',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteTaskType, setDeleteTaskType] = useState<IDeleteModal>(null);
  const [updateTaskType, setUpdateTaskType] = useState<IUpdateModal>(null);
  const [createTaskType, setCreateTaskType] = useState(false);
  const [infoTaskType, setInfoTaskType] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setBackUrl } = useGoBackUrl();
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
    loading: taskTypesLoading,
    data: taskTypesData,
    error: taskTypesError,
    send: getTaskTypes,
    updateData: updateTaskTypesData,
  } = useGet<IPagingResult<ITaskType>>({
    url: '/task_types',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterTaskTypeSchema>({
    resolver: yupResolver(filterTaskTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getTaskTypes({ params: apiParams });
  }, [apiParams, getTaskTypes]);

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
    if (taskTypesError) {
      toast({ message: taskTypesError, severity: 'error' });
    }
  }, [taskTypesError, toast]);

  useEffect(() => {
    updateTitle('Tipos de Tarefas');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createTaskType: checkPermissions([
        [PermissionsUser.create_task_type, PermissionsUser.manage_task_type],
      ]),
      updateTaskType: checkPermissions([
        [PermissionsUser.update_task_type, PermissionsUser.manage_task_type],
      ]),
      deleteTaskType: checkPermissions([
        [PermissionsUser.delete_task_type, PermissionsUser.manage_task_type],
      ]),
      readTask: checkPermissions([[PermissionsUser.read_task, PermissionsUser.manage_task]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateTasks = useCallback(
    (id: string, name: string) => {
      const search = { filters: JSON.stringify({ task_type: { id, name } }) };

      setBackUrl('tasks', location);

      navigate({
        pathname: '/tasks',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, setBackUrl, navigate],
  );

  const cols = useMemo<ICol<ITaskType>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '200px',
        customColumn: ({ id, name }) => {
          return (
            <div style={{ display: 'flex' }}>
              {permissions.readTask && (
                <CustomIconButton
                  type="custom"
                  size="small"
                  title="Ir para Tarefas"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateTasks(id, name)}
                />
              )}

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoTaskType({ id })}
              />

              {permissions.updateTaskType && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar tipo de tarefa"
                  action={() => setUpdateTaskType({ id })}
                />
              )}

              {permissions.deleteTaskType && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar tipo de tarefa"
                  action={() => setDeleteTaskType({ id, name })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [
    handleNavigateTasks,
    permissions.deleteTaskType,
    permissions.readTask,
    permissions.updateTaskType,
  ]);

  const handleApplyFilters = useCallback(
    (formData: IFilterTaskTypeSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'task_types',
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

    resetForm({
      name: '',
      max_updated: null,
      min_updated: null,
    });

    updateState({
      category: 'filters',
      key: 'task_types',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  if (taskTypesLoading) return <Loading loading={taskTypesLoading} />;

  return (
    <>
      {createTaskType && (
        <CreateTaskTypeModal
          openModal={createTaskType}
          closeModal={() => setCreateTaskType(false)}
          handleAdd={(newData) =>
            updateTaskTypesData((current) => handleAddItem({ newData, current }))
          }
        />
      )}

      {!!deleteTaskType && (
        <DeleteTaskTypeModal
          openModal={!!deleteTaskType}
          taskType={deleteTaskType}
          closeModal={() => setDeleteTaskType(null)}
          handleDeleteData={(id) =>
            updateTaskTypesData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateTaskType && (
        <UpdateTaskTypeModal
          openModal={!!updateTaskType}
          closeModal={() => setUpdateTaskType(null)}
          task_type_id={updateTaskType.id}
          handleUpdateData={(id, newData) =>
            updateTaskTypesData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoTaskType && (
        <InfoTaskTypeModal
          openModal={!!infoTaskType}
          closeModal={() => setInfoTaskType(null)}
          task_type_id={infoTaskType.id}
        />
      )}

      {taskTypesData && (
        <CustomTable<ITaskType>
          id="task_types"
          cols={cols}
          data={taskTypesData.data}
          tableMinWidth="500px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createTaskType && (
                <CustomIconButton
                  action={() => setCreateTaskType(true)}
                  title="Cadastrar tipo de tarefa"
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
                    key: 'task_types',
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
                    key: 'task_types',
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
            totalPages: taskTypesData.pagination.total_pages,
            totalResults: taskTypesData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
