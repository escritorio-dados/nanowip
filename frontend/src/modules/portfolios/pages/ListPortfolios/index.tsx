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

import { CreatePortfolioModal } from '#modules/portfolios/components/CreatePortfolio';
import { DeletePortfolioModal } from '#modules/portfolios/components/DeletePortfolio';
import { InfoPortfolioModal } from '#modules/portfolios/components/InfoPortfolio';
import { UpdatePortfolioModal } from '#modules/portfolios/components/UpdatePortfolio';
import { IPortfolio, IPortfolioFilters } from '#modules/portfolios/types/IPortfolio';
import {
  defaultApiConfigProjects,
  stateKeyProjects,
} from '#modules/projects/projects/pages/ListProjects';

import { defaultPortfolioFilter, ListPortfoliosFilter } from './form';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

export const defaultApiConfigPortfolios: IPaginationConfig<IPortfolioFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultPortfolioFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export const stateKeyPortfolios = 'portfolios';

export function ListPortfolio() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IPortfolioFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigPortfolios,
      keepState,
      stateKey: stateKeyPortfolios,
    }),
  );
  const [deletePortfolio, setDeletePortfolio] = useState<IDeleteModal>(null);
  const [updatePortfolio, setUpdatePortfolio] = useState<IUpdateModal>(null);
  const [createPortfolio, setCreatePortfolio] = useState(false);
  const [infoPortfolio, setInfoPortfolio] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const { setBackUrl } = useGoBackUrl();
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
    loading: portfoliosLoading,
    data: portfoliosData,
    error: portfoliosError,
    send: getPortfolios,
    updateData: updatePortfoliosData,
  } = useGet<IPagingResult<IPortfolio>>({
    url: '/portfolios',
    lazy: true,
  });

  useEffect(() => {
    getPortfolios({ params: apiParams });
  }, [apiParams, getPortfolios]);

  useEffect(() => {
    if (portfoliosError) {
      toast({ message: portfoliosError, severity: 'error' });
    }
  }, [portfoliosError, toast]);

  useEffect(() => {
    updateTitle('Portfólios');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createPortfolio: checkPermissions([
        [PermissionsUser.create_portfolio, PermissionsUser.manage_portfolio],
      ]),
      updatePortfolio: checkPermissions([
        [PermissionsUser.update_portfolio, PermissionsUser.manage_portfolio],
      ]),
      deletePortfolio: checkPermissions([
        [PermissionsUser.delete_portfolio, PermissionsUser.manage_portfolio],
      ]),
      readProject: checkPermissions([
        [PermissionsUser.read_project, PermissionsUser.manage_project],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateProjects = useCallback(
    (id: string, name: string) => {
      handleFilterNavigation({
        keepState,
        stateKey: stateKeyProjects,
        defaultApiConfig: defaultApiConfigProjects,
        filters: { portfolio: { id, name } },
      });

      setBackUrl('projects', '/portfolios');

      navigate('/projects');
    },
    [keepState, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<IPortfolio>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '175px',
        minWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box display="flex" alignItems="center">
              {permissions.readProject && (
                <CustomIconButton
                  iconType="custom"
                  iconSize="small"
                  title="Ir para projetos"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateProjects(id, name)}
                />
              )}

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoPortfolio({ id })}
              />

              {permissions.updatePortfolio && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Portfolio"
                  action={() => setUpdatePortfolio({ id })}
                />
              )}

              {permissions.deletePortfolio && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Portfolio"
                  action={() => setDeletePortfolio({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [
    handleNavigateProjects,
    permissions.deletePortfolio,
    permissions.readProject,
    permissions.updatePortfolio,
  ]);

  return (
    <>
      <Loading loading={portfoliosLoading} />

      {createPortfolio && (
        <CreatePortfolioModal
          openModal={createPortfolio}
          closeModal={() => setCreatePortfolio(false)}
          addList={(newData) =>
            updatePortfoliosData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deletePortfolio && (
        <DeletePortfolioModal
          openModal={!!deletePortfolio}
          portfolio={deletePortfolio}
          closeModal={() => setDeletePortfolio(null)}
          updateList={(id) => updatePortfoliosData((current) => handleDeleteItem({ id, current }))}
        />
      )}

      {!!updatePortfolio && (
        <UpdatePortfolioModal
          openModal={!!updatePortfolio}
          closeModal={() => setUpdatePortfolio(null)}
          portfolio_id={updatePortfolio.id}
          updateList={(id, newData) =>
            updatePortfoliosData((current) => handleUpdateItem({ id, data: newData, current }))
          }
        />
      )}

      {!!infoPortfolio && (
        <InfoPortfolioModal
          openModal={!!infoPortfolio}
          closeModal={() => setInfoPortfolio(null)}
          portfolio_id={infoPortfolio.id}
        />
      )}

      <CustomTable<IPortfolio>
        id="portfolios"
        cols={cols}
        data={portfoliosData?.data || []}
        tableMinWidth="375px"
        tableMaxWidth="900px"
        activeFilters={activeFiltersNumber}
        custom_actions={
          <>
            {permissions.createPortfolio && (
              <CustomIconButton
                action={() => setCreatePortfolio(true)}
                title="Cadastrar Portfolio"
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
                  stateKey: stateKeyPortfolios,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListPortfoliosFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyPortfolios,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: portfoliosData?.pagination.total_pages || 1,
          totalResults: portfoliosData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeyPortfolios,
              }),
            ),
        }}
      />
    </>
  );
}
