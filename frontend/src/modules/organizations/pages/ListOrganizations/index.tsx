import { Box } from '@mui/material';
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

import { CreateOrganizationModal } from '#modules/organizations/components/CreateOrganization';
import { DeleteOrganizationModal } from '#modules/organizations/components/DeleteOrganization';
import { InfoOrganizationModal } from '#modules/organizations/components/InfoOrganization';
import { UpdateOrganizationModal } from '#modules/organizations/components/UpdateOrganization';
import {
  DEFAULT_ORGANIZATION_IDS,
  IOrganization,
  IOrganizationFilters,
} from '#modules/organizations/types/IOrganization';

import { defaultOrganizationFilter, ListOrganizationsFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IOrganizationFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultOrganizationFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'organizations';

export function ListOrganization() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IOrganizationFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [deleteOrganization, setDeleteOrganization] = useState<IDeleteModal>(null);
  const [updateOrganization, setUpdateOrganization] = useState<IUpdateModal>(null);
  const [createOrganization, setCreateOrganization] = useState(false);
  const [infoOrganization, setInfoOrganization] = useState<IUpdateModal>(null);

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
    loading: organizationsLoading,
    data: organizationsData,
    error: organizationsError,
    send: getOrganizations,
    updateData: updateOrganizationsData,
  } = useGet<IPagingResult<IOrganization>>({
    url: '/organizations',
    lazy: true,
  });

  useEffect(() => {
    getOrganizations({ params: apiParams });
  }, [apiParams, getOrganizations]);

  useEffect(() => {
    if (organizationsError) {
      toast({ message: organizationsError, severity: 'error' });
    }
  }, [organizationsError, toast]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Organizações');
  }, [updateTitle]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const cols = useMemo<ICol<IOrganization>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '175px',
        minWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box display="flex" alignItems="center">
              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoOrganization({ id })}
              />

              <CustomIconButton
                iconType="edit"
                iconSize="small"
                title="Editar Organização"
                action={() => setUpdateOrganization({ id })}
              />

              {id !== DEFAULT_ORGANIZATION_IDS.SYSTEM &&
                id !== DEFAULT_ORGANIZATION_IDS.UNASPRESS && (
                  <CustomIconButton
                    iconType="delete"
                    iconSize="small"
                    title="Deletar Organização"
                    action={() => setDeleteOrganization({ id, name })}
                  />
                )}
            </Box>
          );
        },
      },
    ];
  }, []);

  if (organizationsLoading) return <Loading loading={organizationsLoading} />;

  return (
    <>
      {createOrganization && (
        <CreateOrganizationModal
          openModal={createOrganization}
          closeModal={() => setCreateOrganization(false)}
          addList={(newData) =>
            updateOrganizationsData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteOrganization && (
        <DeleteOrganizationModal
          openModal={!!deleteOrganization}
          closeModal={() => setDeleteOrganization(null)}
          organization={deleteOrganization}
          updateList={(id) =>
            updateOrganizationsData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateOrganization && (
        <UpdateOrganizationModal
          openModal={!!updateOrganization}
          closeModal={() => setUpdateOrganization(null)}
          organization_id={updateOrganization.id}
          updateList={(id, newData) =>
            updateOrganizationsData((current) => handleUpdateItem({ id, data: newData, current }))
          }
        />
      )}

      {!!infoOrganization && (
        <InfoOrganizationModal
          openModal={!!infoOrganization}
          closeModal={() => setInfoOrganization(null)}
          organization_id={infoOrganization.id}
        />
      )}

      {organizationsData && (
        <CustomTable<IOrganization>
          id="organizations"
          cols={cols}
          data={organizationsData.data}
          tableMinWidth="375px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              <CustomIconButton
                action={() => setCreateOrganization(true)}
                title="Cadastrar Organização"
                iconType="add"
              />
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
            <ListOrganizationsFilter
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
            totalPages: organizationsData.pagination.total_pages,
            totalResults: organizationsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
