import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPagingResult } from '#shared/types/IPagingResult';
import { getApiConfig, updateApiConfig } from '#shared/utils/apiConfig';
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

export const defaultApiConfigOrganizations: IPaginationConfig<IOrganizationFilters> = {
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

export const stateKeyOrganizations = 'organizations';

export function ListOrganization() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IOrganizationFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigOrganizations,
      keepState,
      stateKey: stateKeyOrganizations,
    }),
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

  return (
    <>
      <Loading loading={organizationsLoading} />

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

      <CustomTable<IOrganization>
        id="organizations"
        cols={cols}
        data={organizationsData?.data || []}
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
            updateSort={(sort_by, order_by) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { sort_by, order_by },
                  stateKey: stateKeyOrganizations,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListOrganizationsFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyOrganizations,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: organizationsData?.pagination.total_pages || 1,
          totalResults: organizationsData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeyOrganizations,
              }),
            ),
        }}
      />
    </>
  );
}
