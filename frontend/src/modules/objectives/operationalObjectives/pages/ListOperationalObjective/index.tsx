import { ListAlt } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import {
  IOperationalObjective,
  IOperationalObjectiveFilters,
} from '#modules/objectives/operationalObjectives/types/IOperationalObjective';

import { CreateOperationalObjectiveModal } from '../../components/CreateOperationalObjective';
import { DeleteOperationalObjectiveModal } from '../../components/DeleteOperationalObjective';
import { InfoOperationalObjectiveModal } from '../../components/InfoOperationalObjective';
import { UpdateOperationalObjectiveModal } from '../../components/UpdateOperationalObjective';
import { defaultOperationalObjectiveFilter, ListOperationalObjectivesFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

type IOperationalObjectiveInfo = { id: string; name: string; deadline: string };

export const defaultApiConfigOperationalObjectives: IPaginationConfig<IOperationalObjectiveFilters> =
  {
    page: 1,
    sort_by: 'name',
    order_by: 'ASC',
    filters: defaultOperationalObjectiveFilter,
  };

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  integratedObjective: 'Objetivo Integrado',
  deadline: 'Prazo',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export const stateKeyOperationalObjectives = 'operationalObjectives';

export function ListOperationalObjective() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IOperationalObjectiveFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigOperationalObjectives,
      keepState,
      stateKey: stateKeyOperationalObjectives,
    }),
  );
  const [deleteOperationalObjective, setDeleteOperationalObjective] = useState<IDeleteModal>(null);
  const [updateOperationalObjective, setUpdateOperationalObjective] = useState<IUpdateModal>(null);
  const [createOperationalObjective, setCreateOperationalObjective] = useState(false);
  const [infoOperationalObjective, setInfoOperationalObjective] = useState<IUpdateModal>(null);

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
      integrated_objective_id: apiConfig.filters.integratedObjective?.id,
    };
  }, [apiConfig]);

  const {
    loading: operationalObjectivesLoading,
    data: operationalObjectivesData,
    error: operationalObjectivesError,
    send: getOperationalObjectives,
    updateData: updateOperationalObjectivesData,
  } = useGet<IPagingResult<IOperationalObjective>>({
    url: '/operational_objectives',
    lazy: true,
  });

  useEffect(() => {
    getOperationalObjectives({ params: apiParams });
  }, [apiParams, getOperationalObjectives]);

  useEffect(() => {
    if (operationalObjectivesError) {
      toast({ message: operationalObjectivesError, severity: 'error' });
    }
  }, [operationalObjectivesError, toast]);

  useEffect(() => {
    updateTitle('Objetivos Operacionais');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createOperationalObjective: checkPermissions([
        [
          PermissionsUser.create_operational_objective,
          PermissionsUser.manage_operational_objective,
        ],
      ]),
      updateOperationalObjective: checkPermissions([
        [
          PermissionsUser.update_operational_objective,
          PermissionsUser.manage_operational_objective,
        ],
      ]),
      deleteOperationalObjective: checkPermissions([
        [
          PermissionsUser.delete_operational_objective,
          PermissionsUser.manage_operational_objective,
        ],
      ]),
      readCategories: checkPermissions([
        [PermissionsUser.read_objective_category, PermissionsUser.manage_objective_category],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const operationalObjectivesInfo = useMemo(() => {
    if (!operationalObjectivesData) {
      return [];
    }

    return operationalObjectivesData.data.map((oo) => ({
      ...oo,
      deadline: parseDateApi(oo.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
      integratedObjective: oo.integratedObjective.name,
    }));
  }, [operationalObjectivesData]);

  const handleNavigateCategories = useCallback(
    (id: string) => {
      setBackUrl(`objective_categories`, '/operational_objectives');

      navigate(`/objective_categories/${id}`);
    },
    [navigate, setBackUrl],
  );

  const cols = useMemo<ICol<IOperationalObjectiveInfo>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      { key: 'integratedObjective', header: 'Objectivo Integrado', minWidth: '200px' },
      { key: 'deadline', header: 'Prazo', minWidth: '200px' },
      {
        header: 'Opções',
        minWidth: '175px',
        maxWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {permissions.readCategories && (
                <CustomIconButton
                  iconType="custom"
                  size="small"
                  title="Ir para categorias"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateCategories(id)}
                />
              )}

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoOperationalObjective({ id })}
              />

              {permissions.updateOperationalObjective && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Objetivo Operacional"
                  action={() => setUpdateOperationalObjective({ id })}
                />
              )}

              {permissions.deleteOperationalObjective && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Objetivo Operacional"
                  action={() => setDeleteOperationalObjective({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [
    handleNavigateCategories,
    permissions.deleteOperationalObjective,
    permissions.readCategories,
    permissions.updateOperationalObjective,
  ]);

  return (
    <>
      <Loading loading={operationalObjectivesLoading} />

      {createOperationalObjective && (
        <CreateOperationalObjectiveModal
          openModal={createOperationalObjective}
          closeModal={() => setCreateOperationalObjective(false)}
          addList={(newData) =>
            updateOperationalObjectivesData((current) => handleAddItem({ data: newData, current }))
          }
          defaultIntegratedObjective={apiConfig.filters.integratedObjective}
        />
      )}

      {!!deleteOperationalObjective && (
        <DeleteOperationalObjectiveModal
          openModal={!!deleteOperationalObjective}
          closeModal={() => setDeleteOperationalObjective(null)}
          operationalObjective={deleteOperationalObjective}
          updateList={(id) =>
            updateOperationalObjectivesData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateOperationalObjective && (
        <UpdateOperationalObjectiveModal
          openModal={!!updateOperationalObjective}
          closeModal={() => setUpdateOperationalObjective(null)}
          operational_objective_id={updateOperationalObjective.id}
          updateList={(id, newData) =>
            updateOperationalObjectivesData((current) =>
              handleUpdateItem({ id, data: newData, current }),
            )
          }
        />
      )}

      {!!infoOperationalObjective && (
        <InfoOperationalObjectiveModal
          openModal={!!infoOperationalObjective}
          closeModal={() => setInfoOperationalObjective(null)}
          operational_objective_id={infoOperationalObjective.id}
        />
      )}

      <CustomTable<IOperationalObjectiveInfo>
        id="operationalObjectives"
        cols={cols}
        data={operationalObjectivesInfo}
        goBackUrl={getBackUrl('operational_objectives')}
        tableMinWidth="575px"
        activeFilters={activeFiltersNumber}
        custom_actions={
          <>
            {permissions.createOperationalObjective && (
              <CustomIconButton
                action={() => setCreateOperationalObjective(true)}
                title="Cadastrar Objetivo Operacional"
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
                  stateKey: stateKeyOperationalObjectives,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListOperationalObjectivesFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyOperationalObjectives,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: operationalObjectivesData?.pagination.total_pages || 1,
          totalResults: operationalObjectivesData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeyOperationalObjectives,
              }),
            ),
        }}
      />
    </>
  );
}
