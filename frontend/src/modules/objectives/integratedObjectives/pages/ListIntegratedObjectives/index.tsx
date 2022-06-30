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
  defaultApiConfigOperationalObjectives,
  stateKeyOperationalObjectives,
} from '#modules/objectives/operationalObjectives/pages/ListOperationalObjective';

import { CreateIntegratedObjectiveModal } from '../../components/CreateIntegratedObjective';
import { DeleteIntegratedObjectiveModal } from '../../components/DeleteIntegratedObjective';
import { InfoIntegratedObjectiveModal } from '../../components/InfoIntegratedObjective';
import { UpdateIntegratedObjectiveModal } from '../../components/UpdateIntegratedObjective';
import {
  IIntegratedObjectiveFilters,
  IIntegratedObjective,
} from '../../types/IIntegratedObjective';
import { defaultIntegratedObjectiveFilter, ListIntegratedObjectivesFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

export const defaultApiConfigIntegratedObjectives: IPaginationConfig<IIntegratedObjectiveFilters> =
  {
    page: 1,
    sort_by: 'name',
    order_by: 'ASC',
    filters: defaultIntegratedObjectiveFilter,
  };

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export const stateKeyIntegratedObjectives = 'integratedObjectives';

export function ListIntegratedObjective() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IIntegratedObjectiveFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigIntegratedObjectives,
      keepState,
      stateKey: stateKeyIntegratedObjectives,
    }),
  );
  const [deleteIntegratedObjective, setDeleteIntegratedObjective] = useState<IDeleteModal>(null);
  const [updateIntegratedObjective, setUpdateIntegratedObjective] = useState<IUpdateModal>(null);
  const [createIntegratedObjective, setCreateIntegratedObjective] = useState(false);
  const [infoIntegratedObjective, setInfoIntegratedObjective] = useState<IUpdateModal>(null);

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
    loading: integratedObjectivesLoading,
    data: integratedObjectivesData,
    error: integratedObjectivesError,
    send: getIntegratedObjectives,
    updateData: updateIntegratedObjectivesData,
  } = useGet<IPagingResult<IIntegratedObjective>>({
    url: '/integrated_objectives',
    lazy: true,
  });

  useEffect(() => {
    getIntegratedObjectives({ params: apiParams });
  }, [apiParams, getIntegratedObjectives]);

  useEffect(() => {
    if (integratedObjectivesError) {
      toast({ message: integratedObjectivesError, severity: 'error' });
    }
  }, [integratedObjectivesError, toast]);

  useEffect(() => {
    updateTitle('Objetivos Integrados');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createIntegratedObjective: checkPermissions([
        [PermissionsUser.create_integrated_objective, PermissionsUser.manage_integrated_objective],
      ]),
      updateIntegratedObjective: checkPermissions([
        [PermissionsUser.update_integrated_objective, PermissionsUser.manage_integrated_objective],
      ]),
      deleteIntegratedObjective: checkPermissions([
        [PermissionsUser.delete_integrated_objective, PermissionsUser.manage_integrated_objective],
      ]),
      readOperationalObjective: checkPermissions([
        [PermissionsUser.read_operational_objective, PermissionsUser.manage_operational_objective],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateOperationalObjectives = useCallback(
    (id: string, name: string) => {
      handleFilterNavigation({
        keepState,
        stateKey: stateKeyOperationalObjectives,
        defaultApiConfig: defaultApiConfigOperationalObjectives,
        filters: { integratedObjective: { id, name } },
      });

      setBackUrl('operational_objectives', '/integrated_objectives');

      navigate('/operational_objectives');
    },
    [keepState, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<IIntegratedObjective>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '175px',
        minWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box display="flex" alignItems="center">
              {permissions.readOperationalObjective && (
                <CustomIconButton
                  iconType="custom"
                  iconSize="small"
                  title="Ir para objetivos Operacionais"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateOperationalObjectives(id, name)}
                />
              )}

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoIntegratedObjective({ id })}
              />

              {permissions.updateIntegratedObjective && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Cliente"
                  action={() => setUpdateIntegratedObjective({ id })}
                />
              )}

              {permissions.deleteIntegratedObjective && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Cliente"
                  action={() => setDeleteIntegratedObjective({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [
    handleNavigateOperationalObjectives,
    permissions.deleteIntegratedObjective,
    permissions.readOperationalObjective,
    permissions.updateIntegratedObjective,
  ]);

  return (
    <>
      <Loading loading={integratedObjectivesLoading} />

      {createIntegratedObjective && (
        <CreateIntegratedObjectiveModal
          openModal={createIntegratedObjective}
          closeModal={() => setCreateIntegratedObjective(false)}
          addList={(data) =>
            updateIntegratedObjectivesData((current) => handleAddItem({ data, current }))
          }
        />
      )}

      {!!deleteIntegratedObjective && (
        <DeleteIntegratedObjectiveModal
          openModal={!!deleteIntegratedObjective}
          closeModal={() => setDeleteIntegratedObjective(null)}
          integratedObjective={deleteIntegratedObjective}
          updateList={(id) =>
            updateIntegratedObjectivesData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateIntegratedObjective && (
        <UpdateIntegratedObjectiveModal
          openModal={!!updateIntegratedObjective}
          closeModal={() => setUpdateIntegratedObjective(null)}
          integratedObjective_id={updateIntegratedObjective.id}
          updateList={(id, data) =>
            updateIntegratedObjectivesData((current) => handleUpdateItem({ id, data, current }))
          }
        />
      )}

      {!!infoIntegratedObjective && (
        <InfoIntegratedObjectiveModal
          openModal={!!infoIntegratedObjective}
          closeModal={() => setInfoIntegratedObjective(null)}
          integratedObjective_id={infoIntegratedObjective.id}
        />
      )}

      <CustomTable<IIntegratedObjective>
        id="integratedObjectives"
        cols={cols}
        data={integratedObjectivesData?.data || []}
        tableMinWidth="375px"
        tableMaxWidth="900px"
        activeFilters={activeFiltersNumber}
        custom_actions={
          <>
            {permissions.createIntegratedObjective && (
              <CustomIconButton
                action={() => setCreateIntegratedObjective(true)}
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
                  stateKey: stateKeyIntegratedObjectives,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListIntegratedObjectivesFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyIntegratedObjectives,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: integratedObjectivesData?.pagination.total_pages || 1,
          totalResults: integratedObjectivesData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeyIntegratedObjectives,
              }),
            ),
        }}
      />
    </>
  );
}
