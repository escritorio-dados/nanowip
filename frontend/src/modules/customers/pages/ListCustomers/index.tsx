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

import { CreateCustomerModal } from '#modules/customers/components/CreateCustomer';
import { DeleteCustomerModal } from '#modules/customers/components/DeleteCustomer';
import { InfoCustomerModal } from '#modules/customers/components/InfoCustomer';
import { UpdateCustomerModal } from '#modules/customers/components/UpdateCustomer';
import { ICustomer, ICustomerFilters } from '#modules/customers/types/ICustomer';

import { defaultCustomerFilter, ListCustomersFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<ICustomerFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultCustomerFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'customers';

export function ListCustomer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICustomerFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [deleteCustomer, setDeleteCustomer] = useState<IDeleteModal>(null);
  const [updateCustomer, setUpdateCustomer] = useState<IUpdateModal>(null);
  const [createCustomer, setCreateCustomer] = useState(false);
  const [infoCustomer, setInfoCustomer] = useState<IUpdateModal>(null);

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
    loading: customersLoading,
    data: customersData,
    error: customersError,
    send: getCustomers,
    updateData: updateCustomersData,
  } = useGet<IPagingResult<ICustomer>>({
    url: '/customers',
    lazy: true,
  });

  useEffect(() => {
    getCustomers({ params: apiParams });
  }, [apiParams, getCustomers]);

  useEffect(() => {
    if (customersError) {
      toast({ message: customersError, severity: 'error' });
    }
  }, [customersError, toast]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Clientes');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createCustomer: checkPermissions([
        [PermissionsUser.create_customer, PermissionsUser.manage_customer],
      ]),
      updateCustomer: checkPermissions([
        [PermissionsUser.update_customer, PermissionsUser.manage_customer],
      ]),
      deleteCustomer: checkPermissions([
        [PermissionsUser.delete_customer, PermissionsUser.manage_customer],
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
      const search = { filters: JSON.stringify({ customer: { id, name } }) };

      setBackUrl('projects', location);

      navigate({
        pathname: '/projects',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<ICustomer>[]>(() => {
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
                action={() => setInfoCustomer({ id })}
              />

              {permissions.updateCustomer && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Cliente"
                  action={() => setUpdateCustomer({ id })}
                />
              )}

              {permissions.deleteCustomer && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Cliente"
                  action={() => setDeleteCustomer({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [
    handleNavigateProjects,
    permissions.deleteCustomer,
    permissions.readProject,
    permissions.updateCustomer,
  ]);

  if (customersLoading) return <Loading loading={customersLoading} />;

  return (
    <>
      {createCustomer && (
        <CreateCustomerModal
          openModal={createCustomer}
          closeModal={() => setCreateCustomer(false)}
          addList={(data) => updateCustomersData((current) => handleAddItem({ data, current }))}
        />
      )}

      {!!deleteCustomer && (
        <DeleteCustomerModal
          openModal={!!deleteCustomer}
          closeModal={() => setDeleteCustomer(null)}
          customer={deleteCustomer}
          updateList={(id) => updateCustomersData((current) => handleDeleteItem({ id, current }))}
        />
      )}

      {!!updateCustomer && (
        <UpdateCustomerModal
          openModal={!!updateCustomer}
          closeModal={() => setUpdateCustomer(null)}
          customer_id={updateCustomer.id}
          updateList={(id, data) =>
            updateCustomersData((current) => handleUpdateItem({ id, data, current }))
          }
        />
      )}

      {!!infoCustomer && (
        <InfoCustomerModal
          openModal={!!infoCustomer}
          closeModal={() => setInfoCustomer(null)}
          customer_id={infoCustomer.id}
        />
      )}

      {customersData && (
        <CustomTable<ICustomer>
          id="customers"
          cols={cols}
          data={customersData.data}
          tableMinWidth="375px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createCustomer && (
                <CustomIconButton
                  action={() => setCreateCustomer(true)}
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
            <ListCustomersFilter
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
            totalPages: customersData.pagination.total_pages,
            totalResults: customersData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
