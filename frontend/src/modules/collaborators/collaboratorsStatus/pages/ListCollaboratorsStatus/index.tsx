import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateCollaboratorStatusModal } from '#modules/collaborators/collaboratorsStatus/components/CreateCollaboratorStatus';
import { DeleteCollaboratorStatusModal } from '#modules/collaborators/collaboratorsStatus/components/DeleteCollaboratorStatus';
import { InfoCollaboratorStatusModal } from '#modules/collaborators/collaboratorsStatus/components/InfoCollaboratorStatus';
import { UpdateCollaboratorStatusModal } from '#modules/collaborators/collaboratorsStatus/components/UpdateCollaboratorStatus';
import {
  ICollaboratorStatus,
  ICollaboratorStatusFilters,
} from '#modules/collaborators/collaboratorsStatus/types/ICollaboratorStatus';

import { defaultCollaboratorStatusFilter, ListCollaboratorStatussFilter } from './form';

type IDeleteModal = { id: string; date: string; collaborator: string } | null;
type IUpdateModal = { id: string } | null;

type ICollaboratorStatusFormatted = Omit<ICollaboratorStatus, 'date' | 'salary'> & {
  date: string;
  salary: string;
  collaboratorName: string;
};

const defaultPaginationConfig: IPaginationConfig<ICollaboratorStatusFilters> = {
  page: 1,
  sort_by: 'date',
  order_by: 'DESC',
  filters: defaultCollaboratorStatusFilter,
};

const sortTranslator: Record<string, string> = {
  date: 'Data',
  salary: 'Salario',
  month_hours: 'Horas Trabalhadas',
  collaborator: 'Colaborador',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'collaboratorsStatus';

export function ListCollaboratorStatus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICollaboratorStatusFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [deleteCollaboratorStatus, setDeleteCollaboratorStatus] = useState<IDeleteModal>(null);
  const [updateCollaboratorStatus, setUpdateCollaboratorStatus] = useState<IUpdateModal>(null);
  const [createCollaboratorStatus, setCreateCollaboratorStatus] = useState(false);
  const [infoCollaboratorStatus, setInfoCollaboratorStatus] = useState<IUpdateModal>(null);

  const { getBackUrl } = useGoBackUrl();
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
    loading: collaboratorsStatusLoading,
    data: collaboratorsStatusData,
    error: collaboratorsStatusError,
    send: getCollaboratorStatuss,
    updateData: updateCollaboratorStatussData,
  } = useGet<IPagingResult<ICollaboratorStatus>>({
    url: '/collaborators_status',
    lazy: true,
  });

  useEffect(() => {
    getCollaboratorStatuss({ params: apiParams });
  }, [apiParams, getCollaboratorStatuss]);

  useEffect(() => {
    if (collaboratorsStatusError) {
      toast({ message: collaboratorsStatusError, severity: 'error' });
    }
  }, [collaboratorsStatusError, toast]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Status dos Colaboradores');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createCollaboratorStatus: checkPermissions([
        [PermissionsUser.create_collaborator_status, PermissionsUser.manage_collaborator_status],
      ]),
      updateCollaboratorStatus: checkPermissions([
        [PermissionsUser.update_collaborator_status, PermissionsUser.manage_collaborator_status],
      ]),
      deleteCollaboratorStatus: checkPermissions([
        [PermissionsUser.delete_collaborator_status, PermissionsUser.manage_collaborator_status],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const data = useMemo<ICollaboratorStatusFormatted[]>(() => {
    if (!collaboratorsStatusData) {
      return [];
    }

    return collaboratorsStatusData.data.map((collaboratorStatus) => ({
      ...collaboratorStatus,
      collaboratorName: collaboratorStatus.collaborator.name,
      date: parseDateApi(collaboratorStatus.date, "LLLL 'de' yyyy", '-'),
      salary: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
        collaboratorStatus.salary,
      ),
    }));
  }, [collaboratorsStatusData]);

  const cols = useMemo<ICol<ICollaboratorStatusFormatted>[]>(() => {
    return [
      { key: 'collaboratorName', header: 'Colaborador', minWidth: '200px' },
      { key: 'date', header: 'Data', minWidth: '200px' },
      { key: 'salary', header: 'Salario', minWidth: '150px' },
      { key: 'monthHours', header: 'Horas Trabalhadas', minWidth: '150px' },
      {
        header: 'Opções',
        maxWidth: '150px',
        minWidth: '150px',
        customColumn: ({ id, date, collaboratorName }) => {
          return (
            <Box sx={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoCollaboratorStatus({ id })}
              />

              {permissions.updateCollaboratorStatus && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Status do Colaborador"
                  action={() => setUpdateCollaboratorStatus({ id })}
                />
              )}

              {permissions.deleteCollaboratorStatus && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Status do Colaborador"
                  action={() =>
                    setDeleteCollaboratorStatus({ id, date, collaborator: collaboratorName })
                  }
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [permissions.deleteCollaboratorStatus, permissions.updateCollaboratorStatus]);

  if (collaboratorsStatusLoading) return <Loading loading={collaboratorsStatusLoading} />;

  return (
    <>
      {createCollaboratorStatus && (
        <CreateCollaboratorStatusModal
          openModal={createCollaboratorStatus}
          closeModal={() => setCreateCollaboratorStatus(false)}
          addList={(newData) =>
            updateCollaboratorStatussData((current) => handleAddItem({ data: newData, current }))
          }
          defaultCollaborator={apiConfig.filters.collaborator}
        />
      )}

      {!!deleteCollaboratorStatus && (
        <DeleteCollaboratorStatusModal
          openModal={!!deleteCollaboratorStatus}
          closeModal={() => setDeleteCollaboratorStatus(null)}
          collaboratorStatus={deleteCollaboratorStatus}
          updateList={(id) =>
            updateCollaboratorStatussData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateCollaboratorStatus && (
        <UpdateCollaboratorStatusModal
          openModal={!!updateCollaboratorStatus}
          closeModal={() => setUpdateCollaboratorStatus(null)}
          collaboratorStatus_id={updateCollaboratorStatus.id}
          updateList={(id, newData) =>
            updateCollaboratorStatussData((current) =>
              handleUpdateItem({ id, data: newData, current }),
            )
          }
        />
      )}

      {!!infoCollaboratorStatus && (
        <InfoCollaboratorStatusModal
          openModal={!!infoCollaboratorStatus}
          closeModal={() => setInfoCollaboratorStatus(null)}
          collaboratorStatus_id={infoCollaboratorStatus.id}
        />
      )}

      {collaboratorsStatusData && (
        <CustomTable<ICollaboratorStatusFormatted>
          id="collaboratorsStatus"
          goBackUrl={getBackUrl('collaborators_status')}
          cols={cols}
          data={data}
          activeFilters={activeFiltersNumber}
          tableMinWidth="850px"
          custom_actions={
            <>
              {permissions.createCollaboratorStatus && (
                <CustomIconButton
                  action={() => setCreateCollaboratorStatus(true)}
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
            <ListCollaboratorStatussFilter
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
            totalPages: collaboratorsStatusData.pagination.total_pages,
            totalResults: collaboratorsStatusData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
