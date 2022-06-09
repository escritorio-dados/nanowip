import { ListAlt } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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

import { CreateTrailModal } from '#modules/trails/trails/components/CreateTrail';
import { DeleteTrailModal } from '#modules/trails/trails/components/DeleteTrail';
import { InfoTrailModal } from '#modules/trails/trails/components/InfoTrail';
import { UpdateTrailModal } from '#modules/trails/trails/components/UpdateTrail';
import { ITrail, ITrailFilters } from '#modules/trails/trails/types/ITrail';

import { defaultTrailFilter, ListTrailsFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<ITrailFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultTrailFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'trails';

export function ListTrail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ITrailFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [deleteTrail, setDeleteTrail] = useState<IDeleteModal>(null);
  const [updateTrail, setUpdateTrail] = useState<IUpdateModal>(null);
  const [createTrail, setCreateTrail] = useState(false);
  const [infoTrail, setInfoTrail] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
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
    loading: trailsLoading,
    data: trailsData,
    error: trailsError,
    send: getTrails,
    updateData: updateTrailsData,
  } = useGet<IPagingResult<ITrail>>({
    url: '/trails',
    lazy: true,
  });

  useEffect(() => {
    getTrails({ params: apiParams });
  }, [apiParams, getTrails]);

  useEffect(() => {
    if (trailsError) {
      toast({ message: trailsError, severity: 'error' });
    }
  }, [trailsError, toast]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Trilhas');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createTrail: checkPermissions([[PermissionsUser.create_trail, PermissionsUser.manage_trail]]),
      updateTrail: checkPermissions([[PermissionsUser.update_trail, PermissionsUser.manage_trail]]),
      deleteTrail: checkPermissions([[PermissionsUser.delete_trail, PermissionsUser.manage_trail]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateTasks = useCallback(
    (id: string) => {
      setBackUrl('task_trails', location);

      navigate(`/task_trails/graph/${id}`);
    },
    [location, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<ITrail>[]>(() => {
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
                iconType="custom"
                iconSize="small"
                title="Visualizar Trilha"
                CustomIcon={<ListAlt fontSize="small" />}
                action={() => handleNavigateTasks(id)}
              />

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoTrail({ id })}
              />

              {permissions.updateTrail && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Trilha"
                  action={() => setUpdateTrail({ id })}
                />
              )}

              {permissions.deleteTrail && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Trilha"
                  action={() => setDeleteTrail({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [handleNavigateTasks, permissions.deleteTrail, permissions.updateTrail]);

  if (trailsLoading) return <Loading loading={trailsLoading} />;

  return (
    <>
      {createTrail && (
        <CreateTrailModal
          openModal={createTrail}
          closeModal={() => setCreateTrail(false)}
          addList={(newData) =>
            updateTrailsData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteTrail && (
        <DeleteTrailModal
          openModal={!!deleteTrail}
          closeModal={() => setDeleteTrail(null)}
          trail={deleteTrail}
          updateList={(id) => updateTrailsData((current) => handleDeleteItem({ id, current }))}
        />
      )}

      {!!updateTrail && (
        <UpdateTrailModal
          openModal={!!updateTrail}
          closeModal={() => setUpdateTrail(null)}
          trail_id={updateTrail.id}
          updateList={(id, newData) =>
            updateTrailsData((current) => handleUpdateItem({ id, data: newData, current }))
          }
        />
      )}

      {!!infoTrail && (
        <InfoTrailModal
          openModal={!!infoTrail}
          closeModal={() => setInfoTrail(null)}
          trail_id={infoTrail.id}
        />
      )}

      {trailsData && (
        <CustomTable<ITrail>
          id="trails"
          cols={cols}
          data={trailsData.data}
          tableMinWidth="375px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createTrail && (
                <CustomIconButton
                  action={() => setCreateTrail(true)}
                  title="Cadastrar Cliente"
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
            <ListTrailsFilter
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
            totalPages: trailsData.pagination.total_pages,
            totalResults: trailsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
