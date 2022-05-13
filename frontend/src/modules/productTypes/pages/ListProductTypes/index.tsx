import { yupResolver } from '@hookform/resolvers/yup';
import { ListAlt } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IProductType, IProductTypeFilters } from '#shared/types/backend/IProductType';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateProductTypeModal } from '#modules/productTypes/components/CreateProductType';
import { DeleteProductTypeModal } from '#modules/productTypes/components/DeleteProductType';
import { InfoProductTypeModal } from '#modules/productTypes/components/InfoProductType';
import { UpdateProductTypeModal } from '#modules/productTypes/components/UpdateProductType';
import {
  filterProductTypeSchema,
  IFilterProductTypeSchema,
} from '#modules/productTypes/schema/filterProductType.schema';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IProductTypeFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: {
    name: '',
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListProductType() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProductTypeFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IProductTypeFilters>({
      category: 'filters',
      key: 'product_types',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'product_types',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'product_types',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'product_types',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteProductType, setDeleteProductType] = useState<IDeleteModal>(null);
  const [updateProductType, setUpdateProductType] = useState<IUpdateModal>(null);
  const [createProductType, setCreateProductType] = useState(false);
  const [infoProductType, setInfoProductType] = useState<IUpdateModal>(null);

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
    loading: productTypesLoading,
    data: productTypesData,
    error: productTypesError,
    send: getProductTypes,
    updateData: updateProductTypesData,
  } = useGet<IPagingResult<IProductType>>({
    url: '/product_types',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterProductTypeSchema>({
    resolver: yupResolver(filterProductTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getProductTypes({ params: apiParams });
  }, [apiParams, getProductTypes]);

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
      const search = { filters: JSON.stringify({ product_type: { id, name } }) };

      setBackUrl('products', location);

      navigate({
        pathname: '/products',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, setBackUrl, navigate],
  );

  const cols = useMemo<ICol<IProductType>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '200px',
        customColumn: ({ id, name }) => {
          return (
            <div style={{ display: 'flex' }}>
              {permissions.readProduct && (
                <CustomIconButton
                  type="custom"
                  size="small"
                  title="Ir para Produtos"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateProducts(id, name)}
                />
              )}

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoProductType({ id })}
              />

              {permissions.updateProductType && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar tipo de projeto"
                  action={() => setUpdateProductType({ id })}
                />
              )}

              {permissions.deleteProductType && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar tipo de projeto"
                  action={() => setDeleteProductType({ id, name })}
                />
              )}
            </div>
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

  const handleApplyFilters = useCallback(
    (formData: IFilterProductTypeSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'product_types',
        value: formData,
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
      name: '',
      max_updated: null,
      min_updated: null,
    });

    updateState({
      category: 'filters',
      key: 'product_types',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  if (productTypesLoading) return <Loading loading={productTypesLoading} />;

  return (
    <>
      {createProductType && (
        <CreateProductTypeModal
          openModal={createProductType}
          closeModal={() => setCreateProductType(false)}
          handleAdd={(newData) =>
            updateProductTypesData((current) => handleAddItem({ newData, current }))
          }
        />
      )}

      {!!deleteProductType && (
        <DeleteProductTypeModal
          openModal={!!deleteProductType}
          productType={deleteProductType}
          closeModal={() => setDeleteProductType(null)}
          handleDeleteData={(id) =>
            updateProductTypesData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateProductType && (
        <UpdateProductTypeModal
          openModal={!!updateProductType}
          closeModal={() => setUpdateProductType(null)}
          productType_id={updateProductType.id}
          handleUpdateData={(id, newData) =>
            updateProductTypesData((current) => handleUpdateItem({ id, newData, current }))
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

      {productTypesData && (
        <CustomTable<IProductType>
          id="product_types"
          cols={cols}
          data={productTypesData.data}
          tableMinWidth="500px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createProductType && (
                <CustomIconButton
                  action={() => setCreateProductType(true)}
                  title="Cadastrar tipo de projeto"
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
                    key: 'product_types',
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
                    key: 'product_types',
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
                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="name"
                      label="Nome"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.name}
                      errors={errors.name}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_updated"
                      label="Data de Atualização (Minima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_updated}
                      errors={errors.min_updated}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_updated"
                      label="Data de Atualização (Maxima)"
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
            totalPages: productTypesData.pagination.total_pages,
            totalResults: productTypesData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
