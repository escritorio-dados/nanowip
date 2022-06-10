import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { HeaderList } from '#shared/components/HeaderList';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPagingResult } from '#shared/types/IPagingResult';
import { StatusDateColor } from '#shared/types/IStatusDate';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import { getStatusText } from '#shared/utils/getStatusText';
import { getSortOptions, IPaginationConfig } from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateProductModal } from '#modules/products/products/components/CreateProduct';
import { DeleteProductModal } from '#modules/products/products/components/DeleteProduct';
import { InfoProductModal } from '#modules/products/products/components/InfoProduct';
import { IProductCardInfo, ProductCard } from '#modules/products/products/components/ProductCard';
import { ISubproductCardInfo } from '#modules/products/products/components/SubproductCard';
import { UpdateProductModal } from '#modules/products/products/components/UpdateProduct';
import { IProduct, IProductFilters } from '#modules/products/products/types/IProduct';

import { defaultProductFilter, ListProductsFilter } from './form';
import { ListProductContainer, ProductList } from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IProductFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultProductFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome do Produto',
  deadline: 'Prazo',
  available_date: 'Data de Disponibilidade',
  start_date: 'Data de Inicio',
  end_date: 'Data de Término',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
  project: 'Projeto',
  product_type: 'Tipo de Produto',
  measure: 'Unidade de Medida',
  quantity: 'Quantidade',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'products';

export function ListProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProductFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [createProduct, setCreateProduct] = useState(false);
  const [infoProduct, setInfoProduct] = useState<IUpdateModal>(null);
  const [updateProduct, setUpdateProduct] = useState<IUpdateModal>(null);
  const [deleteProduct, setDeleteProduct] = useState<IDeleteModal>(null);
  const [createSubproduct, setCreateSubproduct] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setBackUrl, getBackUrl } = useGoBackUrl();
  const { updateTitle } = useTitle();
  const { checkPermissions } = useAuth();
  const { toast } = useToast();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      project_id: apiConfig.filters.project?.id,
      product_type_id: apiConfig.filters.product_type?.id,
      measure_id: apiConfig.filters.measure?.id,
      status_date: apiConfig.filters.status_date?.value,
    };
  }, [apiConfig]);

  const {
    loading: productsLoading,
    data: productsData,
    error: productsError,
    send: getProducts,
  } = useGet<IPagingResult<IProduct>>({
    url: '/products',
    lazy: true,
  });

  useEffect(() => {
    getProducts({ params: apiParams });
  }, [apiParams, getProducts]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    if (productsError) {
      toast({ message: productsError, severity: 'error' });
    }
  }, [productsError, toast]);

  useEffect(() => {
    updateTitle('Produtos');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createProduct: checkPermissions([
        [PermissionsUser.create_product, PermissionsUser.manage_product],
      ]),
      updateProduct: checkPermissions([
        [PermissionsUser.update_product, PermissionsUser.manage_product],
      ]),
      deleteProduct: checkPermissions([
        [PermissionsUser.delete_product, PermissionsUser.manage_product],
      ]),
      readValueChain: checkPermissions([
        [PermissionsUser.read_value_chain, PermissionsUser.manage_value_chain],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateValueChains = useCallback(
    (id: string, pathString: string) => {
      const search = { filters: JSON.stringify({ product: { id, pathString } }) };

      setBackUrl('value_chains', location);

      navigate({
        pathname: '/value_chains',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, setBackUrl, navigate],
  );

  const productsFormatted = useMemo<IProductCardInfo[]>(() => {
    if (!productsData) {
      return [];
    }

    return productsData.data.map<IProductCardInfo>((product) => {
      const subproductsFormatted = product.subproducts.map<ISubproductCardInfo>((subproduct) => ({
        ...subproduct,
        status: getStatusText(subproduct.statusDate),
        statusColor: StatusDateColor[subproduct.statusDate.status],
        lateColor: subproduct.statusDate.late ? StatusDateColor.late : undefined,
        pathString: `${subproduct.name} | ${product.name} | ${product.pathString}`,
      }));

      return {
        ...product,
        path: product.pathString,
        subproducts: subproductsFormatted,
        status: getStatusText(product.statusDate),
        statusColor: StatusDateColor[product.statusDate.status],
        lateColor: product.statusDate.late ? StatusDateColor.late : undefined,
        pathString: `${product.name} | ${product.pathString}`,
      };
    });
  }, [productsData]);

  if (productsLoading) return <Loading loading={productsLoading} />;

  return (
    <>
      {createProduct && (
        <CreateProductModal
          openModal={createProduct}
          closeModal={() => setCreateProduct(false)}
          reloadList={() => getProducts({ params: apiParams })}
          defaultProject={apiConfig.filters.project}
        />
      )}

      {createSubproduct && (
        <CreateProductModal
          openModal={!!createSubproduct}
          closeModal={() => setCreateSubproduct(null)}
          reloadList={() => getProducts({ params: apiParams })}
          product_id={createSubproduct.id}
        />
      )}

      {updateProduct && (
        <UpdateProductModal
          openModal={!!updateProduct}
          closeModal={() => setUpdateProduct(null)}
          product_id={updateProduct.id}
          reloadList={() => getProducts({ params: apiParams })}
        />
      )}

      {infoProduct && (
        <InfoProductModal
          openModal={!!infoProduct}
          closeModal={() => setInfoProduct(null)}
          product_id={infoProduct.id}
        />
      )}

      {deleteProduct && (
        <DeleteProductModal
          openModal={!!deleteProduct}
          closeModal={() => setDeleteProduct(null)}
          product={deleteProduct}
          reloadList={() => getProducts({ params: apiParams })}
        />
      )}

      <ListProductContainer>
        <HeaderList
          id="products"
          goBackUrl={getBackUrl('products')}
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createProduct && (
                <CustomIconButton
                  action={() => setCreateProduct(true)}
                  title="Cadastrar Produto"
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
            <ListProductsFilter
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
            totalPages: productsData?.pagination.total_pages || 1,
            totalResults: productsData?.pagination.total_results || 0,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        >
          <ProductList>
            {productsFormatted.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                permissions={permissions}
                setCreateSub={(id) => setCreateSubproduct({ id })}
                setInfo={(id) => setInfoProduct({ id })}
                setUpdate={(id) => setUpdateProduct({ id })}
                setDelete={(id, name) => setDeleteProduct({ id, name })}
                navigateValueChains={handleNavigateValueChains}
              />
            ))}
          </ProductList>
        </HeaderList>
      </ListProductContainer>
    </>
  );
}
