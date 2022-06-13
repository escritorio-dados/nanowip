import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPagingResult } from '#shared/types/IPagingResult';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { getApiConfig, updateApiConfig } from '#shared/utils/apiConfig';
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

export const defaultApiConfigTaskTypes: IPaginationConfig<ITaskTypeFilters> = {
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

export const stateKeyTaskTypes = 'task_types';

export function ListTaskType() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ITaskTypeFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigTaskTypes,
      keepState,
      stateKey: stateKeyTaskTypes,
    }),
  );
  const [deleteTaskType, setDeleteTaskType] = useState<IDeleteModal>(null);
  const [updateTaskType, setUpdateTaskType] = useState<IUpdateModal>(null);
  const [createTaskType, setCreateTaskType] = useState(false);
  const [infoTaskType, setInfoTaskType] = useState<IUpdateModal>(null);

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
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

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
  }, [permissions.deleteTaskType, permissions.updateTaskType]);

  return (
    <>
      <Loading loading={taskTypesLoading} />

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

      <CustomTable<ITaskType>
        id="task_types"
        cols={cols}
        data={taskTypesData?.data || []}
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
            updateSort={(sort_by, order_by) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { sort_by, order_by },
                  stateKey: stateKeyTaskTypes,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListTaskTypesFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyTaskTypes,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: taskTypesData?.pagination.total_pages || 1,
          totalResults: taskTypesData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeyTaskTypes,
              }),
            ),
        }}
      />
    </>
  );
}
