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

import {
  IServiceProvider,
  IServiceProviderFilters,
} from '#modules/costs/serviceProviders/types/IServiceProvider';

import { CreateServiceProviderModal } from '../../components/CreateServiceProvider';
import { DeleteServiceProviderModal } from '../../components/DeleteServiceProvider';
import { InfoServiceProviderModal } from '../../components/InfoServiceProvider';
import { UpdateServiceProviderModal } from '../../components/UpdateServiceProvider';
import { defaultServiceProviderFilter, ListServiceProvidersFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IServiceProviderFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultServiceProviderFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'service_providers';

export function ListServiceProvider() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IServiceProviderFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [deleteServiceProvider, setDeleteServiceProvider] = useState<IDeleteModal>(null);
  const [updateServiceProvider, setUpdateServiceProvider] = useState<IUpdateModal>(null);
  const [createServiceProvider, setCreateServiceProvider] = useState(false);
  const [infoServiceProvider, setInfoServiceProvider] = useState<IUpdateModal>(null);

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
    loading: serviceProvidersLoading,
    data: serviceProvidersData,
    error: serviceProvidersError,
    send: getServiceProviders,
    updateData: updateServiceProvidersData,
  } = useGet<IPagingResult<IServiceProvider>>({
    url: '/service_providers',
    lazy: true,
  });

  useEffect(() => {
    getServiceProviders({ params: apiParams });
  }, [apiParams, getServiceProviders]);

  useEffect(() => {
    if (serviceProvidersError) {
      toast({ message: serviceProvidersError, severity: 'error' });
    }
  }, [serviceProvidersError, toast]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Prestadores de Serviço');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createServiceProvider: checkPermissions([
        [PermissionsUser.create_document_type, PermissionsUser.manage_document_type],
      ]),
      updateServiceProvider: checkPermissions([
        [PermissionsUser.update_document_type, PermissionsUser.manage_document_type],
      ]),
      deleteServiceProvider: checkPermissions([
        [PermissionsUser.delete_document_type, PermissionsUser.manage_document_type],
      ]),
      readCosts: checkPermissions([[PermissionsUser.read_cost, PermissionsUser.manage_cost]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateCosts = useCallback(
    (id: string, name: string) => {
      const search = { filters: JSON.stringify({ serviceProvider: { id, name } }) };

      setBackUrl('costs', location);

      navigate({
        pathname: '/costs',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<IServiceProvider>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '175px',
        minWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box display="flex" alignItems="center">
              {permissions.readCosts && (
                <CustomIconButton
                  iconType="custom"
                  iconSize="small"
                  title="Ir para custos"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateCosts(id, name)}
                />
              )}

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoServiceProvider({ id })}
              />

              {permissions.updateServiceProvider && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Prestador de Serviço"
                  action={() => setUpdateServiceProvider({ id })}
                />
              )}

              {permissions.deleteServiceProvider && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Prestador de Serviço"
                  action={() => setDeleteServiceProvider({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [
    handleNavigateCosts,
    permissions.deleteServiceProvider,
    permissions.readCosts,
    permissions.updateServiceProvider,
  ]);

  if (serviceProvidersLoading) return <Loading loading={serviceProvidersLoading} />;

  return (
    <>
      {createServiceProvider && (
        <CreateServiceProviderModal
          openModal={createServiceProvider}
          closeModal={() => setCreateServiceProvider(false)}
          addList={(newData) =>
            updateServiceProvidersData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteServiceProvider && (
        <DeleteServiceProviderModal
          openModal={!!deleteServiceProvider}
          closeModal={() => setDeleteServiceProvider(null)}
          serviceProvider={deleteServiceProvider}
          updateList={(id) =>
            updateServiceProvidersData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateServiceProvider && (
        <UpdateServiceProviderModal
          openModal={!!updateServiceProvider}
          closeModal={() => setUpdateServiceProvider(null)}
          service_provider_id={updateServiceProvider.id}
          updateList={(id, newData) =>
            updateServiceProvidersData((current) =>
              handleUpdateItem({ id, data: newData, current }),
            )
          }
        />
      )}

      {!!infoServiceProvider && (
        <InfoServiceProviderModal
          openModal={!!infoServiceProvider}
          closeModal={() => setInfoServiceProvider(null)}
          service_provider_id={infoServiceProvider.id}
        />
      )}

      {serviceProvidersData && (
        <CustomTable<IServiceProvider>
          id="service_providers"
          cols={cols}
          data={serviceProvidersData.data}
          tableMinWidth="375px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createServiceProvider && (
                <CustomIconButton
                  action={() => setCreateServiceProvider(true)}
                  title="Cadastrar Prestador de Serviço"
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
            <ListServiceProvidersFilter
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
            totalPages: serviceProvidersData.pagination.total_pages,
            totalResults: serviceProvidersData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
