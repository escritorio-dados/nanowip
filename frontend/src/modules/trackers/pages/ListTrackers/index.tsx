import { ListAlt } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IPagingResult } from '#shared/types/IPagingResult';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { getApiConfig, updateApiConfig } from '#shared/utils/apiConfig';
import { getSortOptions, IPaginationConfig } from '#shared/utils/pagination';
import { getDurationDates, parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateTrackerModal } from '#modules/trackers/components/CreateTracker';
import { DeleteTrackerModal } from '#modules/trackers/components/DeleteTracker';
import { InfoTrackerModal } from '#modules/trackers/components/InfoTracker';
import { UpdateTrackerModal } from '#modules/trackers/components/UpdateTracker';
import { ITracker, ITrackerFilters } from '#modules/trackers/types/ITracker';

import { defaultTrackerFilter, ListTrackersFilter } from './form';

type IInfoTracker = Omit<ITracker, 'start' | 'end' | 'duration'> & {
  collaboratorName: string;
  duration: string;
  start: string;
};

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

export const defaultApiConfigTrackers: IPaginationConfig<ITrackerFilters> = {
  page: 1,
  sort_by: 'start',
  order_by: 'DESC',
  filters: defaultTrackerFilter,
};

const sortTranslator: Record<string, string> = {
  task: 'Tarefa',
  collaborator: 'Colaborador',
  reason: 'Motivo',
  start: 'Inicio',
  end: 'Fim',
  updated_at: 'Data de Atualiza????o',
  created_at: 'Data de Cria????o',
};

const sortOptions = getSortOptions(sortTranslator);

export const stateKeyTrackers = 'trackers';

export function ListTracker() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ITrackerFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigTrackers,
      keepState,
      stateKey: stateKeyTrackers,
    }),
  );
  const [createTracker, setCreateTracker] = useState<boolean>(false);
  const [deleteTracker, setDeleteTracker] = useState<IDeleteModal>(null);
  const [updateTracker, setUpdateTracker] = useState<IUpdateModal>(null);
  const [infoTracker, setInfoTracker] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
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

  useEffect(() => {
    getTrackers({ params: apiParams });
  }, [apiParams, getTrackers]);

  useEffect(() => {
    if (trackersError) {
      toast({ message: trackersError, severity: 'error' });
    }
  }, [trackersError, toast]);

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

  const handleNavigateValueChain = useCallback(
    (id: string) => {
      setBackUrl('tasks', '/trackers');

      navigate(`/tasks/graph/${id}`);
    },
    [navigate, setBackUrl],
  );

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
        minWidth: '200px',
        maxWidth: '400px',
        customColumn: ({ path, reason }) => {
          const reasonText = `[SV] ${reason}`;

          if (reason)
            return (
              <CustomTooltip title={reasonText}>
                <TextEllipsis fontSize="0.875rem">{reasonText}</TextEllipsis>
              </CustomTooltip>
            );

          return (
            <CustomTooltip
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
              <Box width="100%">
                <TextEllipsis
                  fontSize="0.875rem"
                  sx={(theme) => ({
                    color: theme.palette.primary.main,
                  })}
                >
                  {path.subproduct?.name ? `${path.subproduct?.name} | ` : ''}
                  {path.product.name}
                </TextEllipsis>

                <TextEllipsis fontSize="0.875rem">
                  {path.task.name} | {path.valueChain.name}
                </TextEllipsis>
              </Box>
            </CustomTooltip>
          );
        },
      },
      { key: 'start', header: 'Inicio', maxWidth: '170x' },
      { key: 'duration', header: 'Dura????o', maxWidth: '150px' },
      {
        header: 'Op????es',
        minWidth: '175px',
        maxWidth: '175px',
        customColumn: ({ id, path, collaboratorName, reason }) => {
          return (
            <Box sx={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              {path && permissions.readValueChain && (
                <CustomIconButton
                  iconType="custom"
                  CustomIcon={<ListAlt fontSize="small" />}
                  title="Ir para Cadeia de Valor"
                  action={() => handleNavigateValueChain(path.valueChain.id)}
                />
              )}

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informa????es"
                action={() => setInfoTracker({ id })}
              />

              {permissions.updateTracker && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Tracker"
                  action={() => setUpdateTracker({ id })}
                />
              )}

              {permissions.deleteTracker && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Tracker"
                  action={() =>
                    setDeleteTracker({
                      id,
                      name: `${collaboratorName} - ${path?.task.name || reason}`,
                    })
                  }
                />
              )}
            </Box>
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

  return (
    <>
      <Loading loading={trackersLoading} />

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

      <CustomTable<IInfoTracker>
        id="trackers"
        cols={cols}
        data={data}
        goBackUrl={getBackUrl('trackers')}
        tableMinWidth="870px"
        activeFilters={activeFiltersNumber}
        custom_actions={
          <>
            {permissions.createTracker && (
              <CustomIconButton
                iconType="add"
                title="Cadastrar Tracker"
                action={() => setCreateTracker(true)}
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
                  stateKey: stateKeyTrackers,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListTrackersFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyTrackers,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: trackersData?.pagination.total_pages || 1,
          totalResults: trackersData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeyTrackers,
              }),
            ),
        }}
      />
    </>
  );
}
