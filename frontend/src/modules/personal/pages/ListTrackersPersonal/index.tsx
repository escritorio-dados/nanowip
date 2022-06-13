import { Box, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IPagingResult } from '#shared/types/IPagingResult';
import { getApiConfig, updateApiConfig } from '#shared/utils/apiConfig';
import { getSortOptions, IPaginationConfig } from '#shared/utils/pagination';
import { getDurationDates, parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateTrackerPersonalModal } from '#modules/personal/components/CreateTrackerPersonal';
import { UpdateTrackerPersonalModal } from '#modules/personal/components/UpdateTrackerPersonal';
import { DeleteTrackerModal } from '#modules/trackers/components/DeleteTracker';
import { InfoTrackerModal } from '#modules/trackers/components/InfoTracker';
import { ITracker, ITrackerFiltersPersonal } from '#modules/trackers/types/ITracker';

import { defaultPersonalTrackersFilter, ListPersonalTrackersFilter } from './form';

type IInfoTracker = Omit<ITracker, 'start' | 'end' | 'duration'> & {
  duration: string;
  start: string;
};

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

export const defaultApiConfigTrackersPersonal: IPaginationConfig<ITrackerFiltersPersonal> = {
  page: 1,
  sort_by: 'start',
  order_by: 'DESC',
  filters: defaultPersonalTrackersFilter,
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

export const stateKeyTrackersPersonal = 'trackers_personal';

export function ListTrackerPersonal() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ITrackerFiltersPersonal>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigTrackersPersonal,
      keepState,
      stateKey: stateKeyTrackersPersonal,
    }),
  );
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

  useEffect(() => {
    getTrackers({ params: apiParams });
  }, [apiParams, getTrackers]);

  useEffect(() => {
    if (trackersError) {
      toast({ message: trackersError, severity: 'error' });
    }
  }, [trackersError, toast]);

  useEffect(() => {
    updateTitle('Meus Trackers');
  }, [updateTitle]);

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
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoTracker({ id })}
              />

              <CustomIconButton
                iconType="edit"
                iconSize="small"
                title="Editar Tracker"
                action={() => setUpdateTracker({ id })}
              />

              <CustomIconButton
                iconType="delete"
                iconSize="small"
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

  return (
    <>
      <Loading loading={trackersLoading} />

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

      <CustomTable<IInfoTracker>
        id="trackers_personal"
        cols={cols}
        data={data}
        tableMinWidth="1000px"
        activeFilters={activeFiltersNumber}
        custom_actions={
          <>
            <CustomIconButton
              iconType="add"
              title="Cadastrar Tracker"
              action={() => setCreateTracker(true)}
            />
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
                  stateKey: stateKeyTrackersPersonal,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListPersonalTrackersFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyTrackersPersonal,
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
                stateKey: stateKeyTrackersPersonal,
              }),
            ),
        }}
      />
    </>
  );
}
