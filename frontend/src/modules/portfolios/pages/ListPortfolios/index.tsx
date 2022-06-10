import { ListAlt } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
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

import { defaultPortfolioFilter, ListPortfoliosFilter } from './form';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IPortfolioFilters> = {
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

const stateKey = 'portfolios';

export function ListPortfolio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IPortfolioFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [deletePortfolio, setDeletePortfolio] = useState<IDeleteModal>(null);
  const [updatePortfolio, setUpdatePortfolio] = useState<IUpdateModal>(null);
  const [createPortfolio, setCreatePortfolio] = useState(false);
  const [infoPortfolio, setInfoPortfolio] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
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
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

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
      const search = { filters: JSON.stringify({ portfolio: { id, name } }) };

      setBackUrl('projects', location);

      navigate({
        pathname: '/projects',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
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

  if (portfoliosLoading) return <Loading loading={portfoliosLoading} />;

  return (
    <>
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

      {portfoliosData && (
        <CustomTable<IPortfolio>
          id="portfolios"
          cols={cols}
          data={portfoliosData.data}
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
            <ListPortfoliosFilter
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
            totalPages: portfoliosData.pagination.total_pages,
            totalResults: portfoliosData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
