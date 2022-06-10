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
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { IPagingResult } from '#shared/types/IPagingResult';
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
  IDocumentType,
  IDocumentTypeFilters,
} from '#modules/costs/documentTypes/types/IDocumentType';

import { CreateDocumentTypeModal } from '../../components/CreateDocumentType';
import { DeleteDocumentTypeModal } from '../../components/DeleteDocumentType';
import { InfoDocumentTypeModal } from '../../components/InfoDocumentType';
import { UpdateDocumentTypeModal } from '../../components/UpdateDocumentType';
import { defaultDocumentTypeFilter, ListDocumentTypesFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IDocumentTypeFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultDocumentTypeFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'document_types';

export function ListDocumentType() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IDocumentTypeFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [deleteDocumentType, setDeleteDocumentType] = useState<IDeleteModal>(null);
  const [updateDocumentType, setUpdateDocumentType] = useState<IUpdateModal>(null);
  const [createDocumentType, setCreateDocumentType] = useState(false);
  const [infoDocumentType, setInfoDocumentType] = useState<IUpdateModal>(null);

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
    loading: documentTypesLoading,
    data: documentTypesData,
    error: documentTypesError,
    send: getDocumentTypes,
    updateData: updateDocumentTypesData,
  } = useGet<IPagingResult<IDocumentType>>({
    url: '/document_types',
    lazy: true,
  });

  useEffect(() => {
    getDocumentTypes({ params: apiParams });
  }, [apiParams, getDocumentTypes]);

  useEffect(() => {
    if (documentTypesError) {
      toast({ message: documentTypesError, severity: 'error' });
    }
  }, [documentTypesError, toast]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Tipos de documentos');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createDocumentType: checkPermissions([
        [PermissionsUser.create_document_type, PermissionsUser.manage_document_type],
      ]),
      updateDocumentType: checkPermissions([
        [PermissionsUser.update_document_type, PermissionsUser.manage_document_type],
      ]),
      deleteDocumentType: checkPermissions([
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
      const search = { filters: JSON.stringify({ documentType: { id, name } }) };

      setBackUrl('costs', location);

      navigate({
        pathname: '/costs',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<IDocumentType>[]>(() => {
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
                action={() => setInfoDocumentType({ id })}
              />

              {permissions.updateDocumentType && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Tipo de documento"
                  action={() => setUpdateDocumentType({ id })}
                />
              )}

              {permissions.deleteDocumentType && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Tipo de documento"
                  action={() => setDeleteDocumentType({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [
    handleNavigateCosts,
    permissions.deleteDocumentType,
    permissions.readCosts,
    permissions.updateDocumentType,
  ]);

  if (documentTypesLoading) return <Loading loading={documentTypesLoading} />;

  return (
    <>
      {createDocumentType && (
        <CreateDocumentTypeModal
          openModal={createDocumentType}
          closeModal={() => setCreateDocumentType(false)}
          addList={(newData) =>
            updateDocumentTypesData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteDocumentType && (
        <DeleteDocumentTypeModal
          openModal={!!deleteDocumentType}
          closeModal={() => setDeleteDocumentType(null)}
          documentType={deleteDocumentType}
          updateList={(id) =>
            updateDocumentTypesData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateDocumentType && (
        <UpdateDocumentTypeModal
          openModal={!!updateDocumentType}
          closeModal={() => setUpdateDocumentType(null)}
          document_type_id={updateDocumentType.id}
          updateList={(id, newData) =>
            updateDocumentTypesData((current) => handleUpdateItem({ id, data: newData, current }))
          }
        />
      )}

      {!!infoDocumentType && (
        <InfoDocumentTypeModal
          openModal={!!infoDocumentType}
          closeModal={() => setInfoDocumentType(null)}
          document_type_id={infoDocumentType.id}
        />
      )}

      {documentTypesData && (
        <CustomTable<IDocumentType>
          id="document_types"
          cols={cols}
          data={documentTypesData.data}
          tableMinWidth="375px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createDocumentType && (
                <CustomIconButton
                  action={() => setCreateDocumentType(true)}
                  title="Cadastrar Tipo de documento"
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
            <ListDocumentTypesFilter
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
            totalPages: documentTypesData.pagination.total_pages,
            totalResults: documentTypesData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
