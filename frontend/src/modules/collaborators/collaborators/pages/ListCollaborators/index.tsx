import { ListAlt } from '@mui/icons-material';
import { Avatar, Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomPopover } from '#shared/components/CustomPopover';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPagingResult } from '#shared/types/IPagingResult';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { getApiConfig, handleFilterNavigation, updateApiConfig } from '#shared/utils/apiConfig';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import {
  defaultApiConfigAssignments,
  stateKeyAssignments,
} from '#modules/assignments/pages/ListAssignments';
import { CreateCollaboratorModal } from '#modules/collaborators/collaborators/components/CreateCollaborator';
import { DeleteCollaboratorModal } from '#modules/collaborators/collaborators/components/DeleteCollaborator';
import { InfoCollaboratorModal } from '#modules/collaborators/collaborators/components/InfoCollaborator';
import { UpdateCollaboratorModal } from '#modules/collaborators/collaborators/components/UpdateCollaborator';
import {
  ICollaborator,
  ICollaboratorFilters,
} from '#modules/collaborators/collaborators/types/ICollaborator';
import {
  defaultApiConfigCollaboratorStatus,
  stateKeyCollaboratorStatus,
} from '#modules/collaborators/collaboratorsStatus/pages/ListCollaboratorsStatus';
import { defaultApiConfigTrackers, stateKeyTrackers } from '#modules/trackers/pages/ListTrackers';

import { defaultCollaboratorFilter, ListCollaboratorsFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

export const defaultApiConfigCollaborators: IPaginationConfig<ICollaboratorFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultCollaboratorFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  type: 'Tipo',
  jobTitle: 'Cargo',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export const stateKeyCollaborators = 'collaborators';

export function ListCollaborator() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICollaboratorFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigCollaborators,
      keepState,
      stateKey: stateKeyCollaborators,
    }),
  );
  const [deleteCollaborator, setDeleteCollaborator] = useState<IDeleteModal>(null);
  const [updateCollaborator, setUpdateCollaborator] = useState<IUpdateModal>(null);
  const [createCollaborator, setCreateCollaborator] = useState(false);
  const [infoCollaborator, setInfoCollaborator] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
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

  useEffect(() => {
    getCollaborators({ params: apiParams });
  }, [apiParams, getCollaborators]);

  useEffect(() => {
    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });
    }
  }, [collaboratorsError, toast]);

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

  const handleNavigateAssignments = useCallback(
    (id: string, name: string) => {
      handleFilterNavigation({
        keepState,
        stateKey: stateKeyAssignments,
        defaultApiConfig: defaultApiConfigAssignments,
        filters: { collaborator: { id, name } },
      });

      setBackUrl('assignments', '/collaborators');

      navigate('/assignments');
    },
    [keepState, navigate, setBackUrl],
  );

  const handleNavigateTrackers = useCallback(
    (id: string, name: string) => {
      handleFilterNavigation({
        keepState,
        stateKey: stateKeyTrackers,
        defaultApiConfig: defaultApiConfigTrackers,
        filters: { collaborator: { id, name } },
      });

      setBackUrl('trackers', '/collaborators');

      navigate('/trackers');
    },
    [keepState, navigate, setBackUrl],
  );

  const handleNavigateStatus = useCallback(
    (id: string, name: string) => {
      handleFilterNavigation({
        keepState,
        stateKey: stateKeyCollaboratorStatus,
        defaultApiConfig: defaultApiConfigCollaboratorStatus,
        filters: { collaborator: { id, name } },
      });

      setBackUrl('collaborators_status', '/collaborators');

      navigate('/collaborators_status');
    },
    [keepState, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<ICollaborator>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      { key: 'type', header: 'Tipo', minWidth: '200px' },
      { key: 'jobTitle', header: 'Cargo', minWidth: '200px' },
      {
        header: 'Opções',
        mnWidth: '175px',
        maxWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box sx={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              <CustomPopover icon={<ListAlt fontSize="small" />} help="Ir Para">
                <>
                  {permissions.readAssignments && (
                    <CustomIconButton
                      iconType="custom"
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
                      iconType="custom"
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
                      iconType="custom"
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
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoCollaborator({ id })}
              />

              {permissions.updateCollaborator && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Colaborador"
                  action={() => setUpdateCollaborator({ id })}
                />
              )}

              {permissions.deleteCollaborator && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Colaborador"
                  action={() => setDeleteCollaborator({ id, name })}
                />
              )}
            </Box>
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

  return (
    <>
      <Loading loading={collaboratorsLoading} />

      {createCollaborator && (
        <CreateCollaboratorModal
          openModal={createCollaborator}
          closeModal={() => setCreateCollaborator(false)}
          addList={(newData) =>
            updateCollaboratorsData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteCollaborator && (
        <DeleteCollaboratorModal
          openModal={!!deleteCollaborator}
          closeModal={() => setDeleteCollaborator(null)}
          collaborator={deleteCollaborator}
          updateList={(id) =>
            updateCollaboratorsData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateCollaborator && (
        <UpdateCollaboratorModal
          openModal={!!updateCollaborator}
          closeModal={() => setUpdateCollaborator(null)}
          collaborator_id={updateCollaborator.id}
          updateList={(id, newData) =>
            updateCollaboratorsData((current) => handleUpdateItem({ id, data: newData, current }))
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
          data={collaboratorsData?.data || []}
          tableMinWidth="775px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createCollaborator && (
                <CustomIconButton
                  action={() => setCreateCollaborator(true)}
                  title="Cadastrar Colaborador"
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
                    stateKey: stateKeyCollaborators,
                  }),
                );
              }}
            />
          }
          filterContainer={
            <ListCollaboratorsFilter
              apiConfig={apiConfig}
              updateApiConfig={(filters) => {
                setApiConfig(
                  updateApiConfig({
                    apiConfig,
                    keepState,
                    newConfig: { filters, page: 1 },
                    stateKey: stateKeyCollaborators,
                  }),
                );
              }}
            />
          }
          pagination={{
            currentPage: apiConfig.page,
            totalPages: collaboratorsData?.pagination.total_pages || 1,
            totalResults: collaboratorsData?.pagination.total_results || 0,
            changePage: (page) =>
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { page },
                  stateKey: stateKeyCollaborators,
                }),
              ),
          }}
        />
      )}
    </>
  );
}
