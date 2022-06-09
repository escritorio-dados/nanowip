import { LockOpen } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IPathObject } from '#shared/types/backend/shared/ICommonApi';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import { getSortOptions, IPaginationConfig } from '#shared/utils/pagination';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import {
  IAssignment,
  ICloseAssignmentsPersonalFilters,
} from '#modules/assignments/types/IAssignment';
import { ConfirmChangeStatusTaskModal } from '#modules/personal/components/ConfirmChangeStatusTask';

import { defaultCloseAssignmentFilter, ListCloseAssignmentsFilter } from './form';

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
  filters: defaultCloseAssignmentFilter,
};

const sortTranslator: Record<string, string> = {
  task: 'Tarefa',
  product: 'Produto',
  end_date: 'Fim',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'close_assignments_personal';

export function ListCloseAssignmentsPersonal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICloseAssignmentsPersonalFilters>>(
    () => getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
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

  useEffect(() => {
    getAssignments({ params: apiParams });
  }, [apiParams, getAssignments]);

  useEffect(() => {
    if (assignmentsError) {
      toast({ message: assignmentsError, severity: 'error' });
    }
  }, [assignmentsError, toast]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Reabrir Tarefa');
  }, [updateTitle]);

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
        minWidth: '70px',
        maxWidth: '70px',
        customColumn: ({ id, path }) => {
          return (
            <Box sx={{ display: 'flex', position: 'relative' }}>
              <CustomIconButton
                iconType="custom"
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
            <ListCloseAssignmentsFilter
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
            totalPages: assignmentsData.pagination.total_pages,
            totalResults: assignmentsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
