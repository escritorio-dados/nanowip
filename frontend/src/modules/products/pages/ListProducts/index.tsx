import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { HeaderList } from '#shared/components/HeaderList';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IMeasure, limitedMeasuresLength } from '#shared/types/backend/IMeasure';
import { IProduct, IProductFilters } from '#shared/types/backend/IProduct';
import { IProductType, limitedProductTypesLength } from '#shared/types/backend/IProductType';
import { IProject, limitedProjectsLength } from '#shared/types/backend/IProject';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  StatusDateColor,
  statusDateOptions,
  statusDateTranslator,
} from '#shared/types/IStatusDate';
import { getStatusText } from '#shared/utils/getStatusText';
import {
  getSortOptions,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateProductModal } from '#modules/products/components/CreateProduct';
import { DeleteProductModal } from '#modules/products/components/DeleteProduct';
import { InfoProductModal } from '#modules/products/components/InfoProduct';
import { IProductCardInfo, ProductCard } from '#modules/products/components/ProductCard';
import { ISubproductCardInfo } from '#modules/products/components/SubproductCard';
import { UpdateProductModal } from '#modules/products/components/UpdateProduct';
import {
  filterProductSchema,
  IFilterProductSchema,
} from '#modules/products/schemas/filterProduct.schema';

import { ListProductContainer, ProductList } from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IProductFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: {
    name: '',
    status_date: null,
    product_type: null,
    measure: null,
    min_quantity: '',
    max_quantity: '',
    project: null,
    min_available: null,
    max_available: null,
    min_deadline: null,
    max_deadline: null,
    min_start: null,
    max_start: null,
    min_end: null,
    max_end: null,
    min_updated: null,
    max_updated: null,
  },
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

export function ListProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProductFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IProductFilters>({
      category: 'filters',
      key: 'products',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'products',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'products',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'products',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
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

  const {
    loading: projectsLoading,
    data: projectsData,
    error: projectsError,
    send: getProjects,
  } = useGet<IProject[]>({
    url: '/projects/limited/all',
    lazy: true,
  });

  const {
    loading: productTypesLoading,
    data: productTypesData,
    error: productTypesError,
    send: getProductTypes,
  } = useGet<IProductType[]>({
    url: '/product_types/limited',
    lazy: true,
  });

  const {
    loading: measuresLoading,
    data: measuresData,
    error: measuresError,
    send: getMeasures,
  } = useGet<IMeasure[]>({
    url: '/measures/limited',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterProductSchema>({
    resolver: yupResolver(filterProductSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getProducts({ params: apiParams });
  }, [apiParams, getProducts]);

  useEffect(() => {
    const { page, order_by, sort_by, filters } = apiConfig;

    const filtersString = JSON.stringify(removeEmptyFields(filters, true));

    searchParams.set('page', String(page));
    searchParams.set('order_by', order_by);
    searchParams.set('sort_by', sort_by);

    if (filtersString !== '{}') {
      searchParams.set('filters', filtersString);
    } else {
      searchParams.delete('filters');
    }

    setSearchParams(searchParams);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    if (productsError) {
      toast({ message: productsError, severity: 'error' });

      return;
    }

    if (projectsError) {
      toast({ message: projectsError, severity: 'error' });

      return;
    }

    if (productTypesError) {
      toast({ message: productTypesError, severity: 'error' });

      return;
    }

    if (measuresError) {
      toast({ message: measuresError, severity: 'error' });
    }
  }, [productsError, projectsError, toast, productTypesError, measuresError]);

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

  const projectsOptions = useMemo(() => {
    const options = !projectsData ? [] : projectsData;

    if (apiConfig.filters.project) {
      const filter = options.find((project) => project.id === apiConfig.filters.project!.id);

      if (!filter) {
        options.push(apiConfig.filters.project as any);
      }
    }

    return options;
  }, [apiConfig.filters.project, projectsData]);

  const productTypesOptions = useMemo(() => {
    const options = !productTypesData ? [] : productTypesData;

    if (apiConfig.filters.product_type) {
      const filter = options.find(
        (product_type) => product_type.id === apiConfig.filters.product_type!.id,
      );

      if (!filter) {
        options.push(apiConfig.filters.product_type as any);
      }
    }

    return options;
  }, [apiConfig.filters.product_type, productTypesData]);

  const measuresOptions = useMemo(() => {
    const options = !measuresData ? [] : measuresData;

    if (apiConfig.filters.measure) {
      const filter = options.find((measure) => measure.id === apiConfig.filters.measure!.id);

      if (!filter) {
        options.push(apiConfig.filters.measure as any);
      }
    }

    return options;
  }, [apiConfig.filters.measure, measuresData]);

  const handleApplyFilters = useCallback(
    (formData: IFilterProductSchema) => {
      const filtersValue = { ...formData, status_date: formData.status_date?.value || '' };

      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: filtersValue,
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'products',
        value: filtersValue,
        localStorage: true,
      });
    },
    [updateState],
  );

  const handleClearFilters = useCallback(() => {
    setApiConfig((oldConfig) => ({
      ...oldConfig,
      filters: defaultPaginationConfig.filters,
      page: 1,
    }));

    resetForm({
      ...defaultPaginationConfig.filters,
      status_date: defaultPaginationConfig.filters.status_date
        ? {
            label: statusDateTranslator[defaultPaginationConfig.filters.status_date] || '',
            value: defaultPaginationConfig.filters.status_date,
          }
        : null,
    });

    updateState({
      category: 'filters',
      key: 'products',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

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
                  type="add"
                />
              )}
            </>
          }
          sortContainer={
            <Box
              sx={{
                width: '300px',
                padding: '0.6rem',
                border: `2px solid`,
                borderColor: 'divider',
              }}
            >
              <CustomSelect
                label="Classificar por"
                onChange={(newValue) => {
                  setApiConfig((oldConfig) => ({ ...oldConfig, sort_by: newValue.value }));

                  updateState({
                    category: 'sort_by',
                    key: 'products',
                    value: newValue.value,
                    localStorage: true,
                  });
                }}
                options={sortOptions}
                optionLabel="label"
                value={{ value: apiConfig.sort_by, label: sortTranslator[apiConfig.sort_by] }}
              />

              <CustomSelect
                label="Ordem"
                onChange={(newValue) => {
                  setApiConfig((oldConfig) => ({ ...oldConfig, order_by: newValue.value }));

                  updateState({
                    category: 'order_by',
                    key: 'products',
                    value: newValue.value,
                    localStorage: true,
                  });
                }}
                options={orderOptions}
                optionLabel="label"
                value={{ value: apiConfig.order_by, label: orderTranslator[apiConfig.order_by] }}
              />
            </Box>
          }
          filterContainer={
            <>
              <form onSubmit={handleSubmit(handleApplyFilters)} noValidate>
                <Grid container spacing={2}>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="name"
                      label="Nome"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.name}
                      errors={errors.name}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      name="status_date"
                      label="Status"
                      margin_type="no-margin"
                      defaultValue={
                        apiConfig.filters.status_date
                          ? {
                              value: apiConfig.filters.status_date,
                              label: statusDateTranslator[apiConfig.filters.status_date],
                            }
                          : null
                      }
                      options={statusDateOptions}
                      optionLabel="label"
                      errors={errors.status_date as any}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="project"
                      label="Projeto"
                      options={projectsOptions}
                      optionLabel="pathString"
                      optionValue="id"
                      defaultValue={apiConfig.filters.project}
                      margin_type="no-margin"
                      errors={errors.project as any}
                      loading={projectsLoading}
                      handleOpen={() => getProjects()}
                      handleFilter={(params) => getProjects(params)}
                      limitFilter={limitedProjectsLength}
                      filterField="name"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="product_type"
                      label="Tipo de Produto"
                      options={productTypesOptions}
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.product_type}
                      margin_type="no-margin"
                      errors={errors.product_type as any}
                      loading={productTypesLoading}
                      handleOpen={() => getProductTypes()}
                      handleFilter={(params) => getProductTypes(params)}
                      limitFilter={limitedProductTypesLength}
                      filterField="name"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="measure"
                      label="Unidade de Medida"
                      options={measuresOptions}
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.measure}
                      margin_type="no-margin"
                      errors={errors.measure as any}
                      loading={measuresLoading}
                      handleOpen={() => getMeasures()}
                      handleFilter={(params) => getMeasures(params)}
                      limitFilter={limitedMeasuresLength}
                      filterField="name"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="min_quantity"
                      label="Quantidade (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_quantity}
                      errors={errors.min_quantity}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="max_quantity"
                      label="Quantidade (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_quantity}
                      errors={errors.max_quantity}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_deadline"
                      label="Prazo (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_deadline}
                      errors={errors.min_deadline}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_deadline"
                      label="Prazo (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_deadline}
                      errors={errors.max_deadline}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_start"
                      label="Data de Inicio (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_start}
                      errors={errors.min_start}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_start"
                      label="Data de Inicio (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_start}
                      errors={errors.max_start}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_available"
                      label="Data de Disponibilidade (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_available}
                      errors={errors.min_available}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_available"
                      label="Data de Disponibilidade (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_available}
                      errors={errors.max_available}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_end"
                      label="Data de Término (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_end}
                      errors={errors.min_end}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_end"
                      label="Data de Término (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_end}
                      errors={errors.max_end}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_updated"
                      label="Data de Atualização (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_updated}
                      errors={errors.min_updated}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_updated"
                      label="Data de Atualização (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_updated}
                      errors={errors.max_updated}
                    />
                  </Grid>
                </Grid>

                <Grid container columnSpacing={2}>
                  <Grid item md={6} xs={12}>
                    <CustomButton type="submit" size="medium">
                      Aplicar Filtros
                    </CustomButton>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <CustomButton color="info" size="medium" onClick={handleClearFilters}>
                      Limpar Filtros
                    </CustomButton>
                  </Grid>
                </Grid>
              </form>
            </>
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
