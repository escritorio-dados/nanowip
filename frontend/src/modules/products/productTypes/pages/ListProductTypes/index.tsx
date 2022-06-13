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
  defaultApiConfigProducts,
  stateKeyProducts,
} from '#modules/products/products/pages/ListProducts';
import { CreateProductTypeModal } from '#modules/products/productTypes/components/CreateProductType';
import { DeleteProductTypeModal } from '#modules/products/productTypes/components/DeleteProductType';
import { InfoProductTypeModal } from '#modules/products/productTypes/components/InfoProductType';
import { UpdateProductTypeModal } from '#modules/products/productTypes/components/UpdateProductType';
import {
  IProductType,
  IProductTypeFilters,
} from '#modules/products/productTypes/types/IProductType';

import { defaultProductTypeFilter, ListProductTypesFilter } from './form';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

export const defaultApiConfigProductTypes: IPaginationConfig<IProductTypeFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultProductTypeFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export const stateKeyProductTypes = 'product_types';

export function ListProductType() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProductTypeFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigProductTypes,
      keepState,
      stateKey: stateKeyProductTypes,
    }),
  );
  const [deleteProductType, setDeleteProductType] = useState<IDeleteModal>(null);
  const [updateProductType, setUpdateProductType] = useState<IUpdateModal>(null);
  const [createProductType, setCreateProductType] = useState(false);
  const [infoProductType, setInfoProductType] = useState<IUpdateModal>(null);

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
    loading: productTypesLoading,
    data: productTypesData,
    error: productTypesError,
    send: getProductTypes,
    updateData: updateProductTypesData,
  } = useGet<IPagingResult<IProductType>>({
    url: '/product_types',
    lazy: true,
  });

  useEffect(() => {
    getProductTypes({ params: apiParams });
  }, [apiParams, getProductTypes]);

  useEffect(() => {
    if (productTypesError) {
      toast({ message: productTypesError, severity: 'error' });
    }
  }, [productTypesError, toast]);

  useEffect(() => {
    updateTitle('Tipos de Produto');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createProductType: checkPermissions([
        [PermissionsUser.create_product_type, PermissionsUser.manage_product_type],
      ]),
      updateProductType: checkPermissions([
        [PermissionsUser.update_product_type, PermissionsUser.manage_product_type],
      ]),
      deleteProductType: checkPermissions([
        [PermissionsUser.delete_product_type, PermissionsUser.manage_product_type],
      ]),
      readProduct: checkPermissions([
        [PermissionsUser.read_product, PermissionsUser.manage_product],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateProducts = useCallback(
    (id: string, name: string) => {
      handleFilterNavigation({
        keepState,
        stateKey: stateKeyProducts,
        defaultApiConfig: defaultApiConfigProducts,
        filters: { product_type: { id, name } },
      });

      setBackUrl('products', '/product_types');

      navigate('/products');
    },
    [keepState, setBackUrl, navigate],
  );

  const cols = useMemo<ICol<IProductType>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '175px',
        minWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box sx={{ display: 'flex' }}>
              {permissions.readProduct && (
                <CustomIconButton
                  iconType="custom"
                  iconSize="small"
                  title="Ir para Produtos"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateProducts(id, name)}
                />
              )}

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoProductType({ id })}
              />

              {permissions.updateProductType && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar tipo de projeto"
                  action={() => setUpdateProductType({ id })}
                />
              )}

              {permissions.deleteProductType && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar tipo de projeto"
                  action={() => setDeleteProductType({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [
    handleNavigateProducts,
    permissions.deleteProductType,
    permissions.readProduct,
    permissions.updateProductType,
  ]);

  return (
    <>
      <Loading loading={productTypesLoading} />

      {createProductType && (
        <CreateProductTypeModal
          openModal={createProductType}
          closeModal={() => setCreateProductType(false)}
          addList={(newData) =>
            updateProductTypesData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteProductType && (
        <DeleteProductTypeModal
          openModal={!!deleteProductType}
          productType={deleteProductType}
          closeModal={() => setDeleteProductType(null)}
          updateList={(id) =>
            updateProductTypesData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateProductType && (
        <UpdateProductTypeModal
          openModal={!!updateProductType}
          closeModal={() => setUpdateProductType(null)}
          productType_id={updateProductType.id}
          updateList={(id, newData) =>
            updateProductTypesData((current) => handleUpdateItem({ id, data: newData, current }))
          }
        />
      )}

      {!!infoProductType && (
        <InfoProductTypeModal
          openModal={!!infoProductType}
          closeModal={() => setInfoProductType(null)}
          productType_id={infoProductType.id}
        />
      )}

      <CustomTable<IProductType>
        id="product_types"
        cols={cols}
        data={productTypesData?.data || []}
        tableMinWidth="375px"
        tableMaxWidth="900px"
        activeFilters={activeFiltersNumber}
        custom_actions={
          <>
            {permissions.createProductType && (
              <CustomIconButton
                action={() => setCreateProductType(true)}
                title="Cadastrar tipo de projeto"
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
                  stateKey: stateKeyProductTypes,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListProductTypesFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyProductTypes,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: productTypesData?.pagination.total_pages || 1,
          totalResults: productTypesData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeyProductTypes,
              }),
            ),
        }}
      />
    </>
  );
}
