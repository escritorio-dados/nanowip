import { ListAlt } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateTaskTypeModal } from '#modules/tasks/taskTypes/components/CreateTaskType';
import { DeleteTaskTypeModal } from '#modules/tasks/taskTypes/components/DeleteTaskType';
import { InfoTaskTypeModal } from '#modules/tasks/taskTypes/components/InfoTaskType';
import { UpdateTaskTypeModal } from '#modules/tasks/taskTypes/components/UpdateTaskType';
import { ITaskType, ITaskTypeFilters } from '#modules/tasks/taskTypes/types/ITaskType';

import { defaultTaskTypeFilter, ListTaskTypesFilter } from './form';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<ITaskTypeFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultTaskTypeFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'task_types';

export function ListTaskType() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ITaskTypeFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
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

  useEffect(() => {
    getTaskTypes({ params: apiParams });
  }, [apiParams, getTaskTypes]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

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
        maxWidth: '175px',
        minWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box sx={{ display: 'flex' }}>
              {permissions.readTask && (
                <CustomIconButton
                  iconType="custom"
                  iconSize="small"
                  title="Ir para Tarefas"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateTasks(id, name)}
                />
              )}

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoTaskType({ id })}
              />

              {permissions.updateTaskType && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar tipo de tarefa"
                  action={() => setUpdateTaskType({ id })}
                />
              )}

              {permissions.deleteTaskType && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar tipo de tarefa"
                  action={() => setDeleteTaskType({ id, name })}
                />
              )}
            </Box>
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

  if (taskTypesLoading) return <Loading loading={taskTypesLoading} />;

  return (
    <>
      {createTaskType && (
        <CreateTaskTypeModal
          openModal={createTaskType}
          closeModal={() => setCreateTaskType(false)}
          addList={(newData) =>
            updateTaskTypesData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteTaskType && (
        <DeleteTaskTypeModal
          openModal={!!deleteTaskType}
          taskType={deleteTaskType}
          closeModal={() => setDeleteTaskType(null)}
          updateList={(id) => updateTaskTypesData((current) => handleDeleteItem({ id, current }))}
        />
      )}

      {!!updateTaskType && (
        <UpdateTaskTypeModal
          openModal={!!updateTaskType}
          closeModal={() => setUpdateTaskType(null)}
          task_type_id={updateTaskType.id}
          updateList={(id, newData) =>
            updateTaskTypesData((current) => handleUpdateItem({ id, data: newData, current }))
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
          tableMinWidth="375px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createTaskType && (
                <CustomIconButton
                  action={() => setCreateTaskType(true)}
                  title="Cadastrar tipo de tarefa"
                  iconType="add"
                />
              )}
            </>
          }
          sortContainer={
            <SortForm
              sortOptions={sortOptions}
              sortTranslator={sortTranslator}
              defaultOrder={apiConfig.order_by}
              defaultSort={apiConfig.sort_by}
              updateSort={(sortBy, orderBy) => {
                setApiConfig((oldConfig) => ({ ...oldConfig, sort_by: sortBy, order_by: orderBy }));

                keepState.updateManyStates([
                  {
                    category: 'sort_by',
                    key: stateKey,
                    value: sortBy,
                    localStorage: true,
                  },
                  {
                    category: 'order_by',
                    key: stateKey,
                    value: orderBy,
                    localStorage: true,
                  },
                ]);
              }}
            />
          }
          filterContainer={
            <ListTaskTypesFilter
              apiConfig={apiConfig}
              keepState={keepState}
              stateKey={stateKey}
              updateApiConfig={(filters) => {
                setApiConfig((oldConfig) => ({
                  ...oldConfig,
                  filters,
                  page: 1,
                }));
              }}
            />
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
