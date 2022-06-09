import { ListAlt } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPathObject } from '#shared/types/backend/shared/ICommonApi';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import { StatusDateColor } from '#shared/types/IStatusDate';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import { getStatusText } from '#shared/utils/getStatusText';
import {
  getSortOptions,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
} from '#shared/utils/pagination';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { DeleteAssignmentModal } from '#modules/assignments/components/DeleteAssignment';
import { InfoAssignmentModal } from '#modules/assignments/components/InfoAssignment';
import { UpdateAssignmentModal } from '#modules/assignments/components/UpdateAssignment';
import { IAssignment, IAssignmentFilters } from '#modules/assignments/types/IAssignment';

import { defaultAssignmentFilter, ListAssignmentsFilter } from './form';

type IInfoAssignment = {
  id: string;
  collaboratorName: string;
  taskName: string;
  deadline: string;
  path: IPathObject;
  status: string;
  statusColor: string;
  lateColor: string;
};

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IAssignmentFilters> = {
  page: 1,
  sort_by: 'collaborator',
  order_by: 'ASC',
  filters: defaultAssignmentFilter,
};

const sortTranslator: Record<string, string> = {
  task: 'Tarefa',
  collaborator: 'Colaborador',
  start_date: 'Data de Inicio',
  end_date: 'Data de Término',
  deadline: 'Prazo',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'assignments';

export function ListAssignment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IAssignmentFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
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
      status_date: apiConfig.filters.status_date?.value,
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

  const data = useMemo(() => {
    if (!assignmentsData) {
      return [];
    }

    return assignmentsData.data.map((assignment) => ({
      ...assignment,
      collaboratorName: assignment.collaborator.name,
      taskName: assignment.path.task.name,
      deadline: parseDateApi(assignment.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
      status: getStatusText(assignment.statusDate),
      statusColor: StatusDateColor[assignment.statusDate.status],
      lateColor: assignment.statusDate.late ? StatusDateColor.late : undefined,
    }));
  }, [assignmentsData]);

  const cols = useMemo<ICol<IInfoAssignment>[]>(() => {
    return [
      {
        header: '',
        maxWidth: '50px',
        minWidth: '50px',
        padding: '0',
        customColumn: ({ status, lateColor, statusColor }) => {
          return (
            <CustomTooltip title={status}>
              <Box
                sx={{
                  display: 'flex',
                  width: '100%',
                  height: '40px',
                }}
              >
                {lateColor && <Box sx={{ background: lateColor, flex: 0.6 }} />}

                <Box sx={{ background: statusColor, flex: 1 }}> </Box>
              </Box>
            </CustomTooltip>
          );
        },
      },
      {
        header: 'Tarefa',
        minWidth: '200px',
        maxWidth: '500px',
        customColumn: ({ path }) => {
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
              <Box height="100%" alignItems="center">
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
      { key: 'collaboratorName', header: 'Colaborador', minWidth: '200px' },
      { key: 'deadline', header: 'Prazo', minWidth: '180px', maxWidth: '180px' },
      {
        header: 'Opções',
        maxWidth: '170px',
        customColumn: ({ id, path, collaboratorName }) => {
          return (
            <Box sx={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              {permissions.readValueChain && (
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
                title="Informações"
                action={() => setInfoAssignment({ id })}
              />

              {permissions.updateAssignment && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Atribuição"
                  action={() => setUpdateAssignment({ id })}
                />
              )}

              {permissions.deleteAssignment && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Atribuição"
                  action={() =>
                    setDeleteAssignment({ id, name: `${collaboratorName} - ${path.task.name}` })
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
          updateList={(id) => updateAssignmentsData((current) => handleDeleteItem({ id, current }))}
        />
      )}

      {!!updateAssignment && (
        <UpdateAssignmentModal
          openModal={!!updateAssignment}
          closeModal={() => setUpdateAssignment(null)}
          assignment_id={updateAssignment.id}
          updateList={(id, newData) =>
            updateAssignmentsData((current) => handleUpdateItem({ id, data: newData, current }))
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
          tableMinWidth="800px"
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
            <ListAssignmentsFilter
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
