import { yupResolver } from '@hookform/resolvers/yup';
import { LibraryAdd } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
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
import { TextEllipsis } from '#shared/styledComponents/common';
import { IProduct, limitedProductLength } from '#shared/types/backend/IProduct';
import { IValueChain, IValueChainFilters } from '#shared/types/backend/IValueChain';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  StatusDateColor,
  statusDateNoLateOptions,
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

import { CreateValueChainModal } from '#modules/valueChains/components/CreateValueChain';
import { CreateValueChainTrailModal } from '#modules/valueChains/components/CreateValueChainTrail';
import { DeleteValueChainModal } from '#modules/valueChains/components/DeleteValueChain';
import { InfoValueChainModal } from '#modules/valueChains/components/InfoValueChain';
import { UpdateValueChainModal } from '#modules/valueChains/components/UpdateValueChain';
import {
  IValueChainCardInfo,
  ValueChainCard,
} from '#modules/valueChains/components/ValueChainCard';
import {
  filterValueChainSchema,
  IFilterValueChainSchema,
} from '#modules/valueChains/schemas/filterValueChain.schema';

import { ListValueChainContainer, ValueChainList } from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IValueChainFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: {
    name: '',
    status_date: null,
    product: null,
    min_available: null,
    max_available: null,
    min_start: null,
    max_start: null,
    min_end: null,
    max_end: null,
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  available_date: 'Data de Disponibilidade',
  start_date: 'Data de Inicio',
  end_date: 'Data de Término',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
  product: 'Produto',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListValueChains() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IValueChainFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IValueChainFilters>({
      category: 'filters',
      key: 'value_chains',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'value_chains',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'value_chains',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'value_chains',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [createValueChain, setCreateValueChain] = useState(false);
  const [createValueChainTrail, setCreateValueChainTrail] = useState(false);
  const [infoValueChain, setInfoValueChain] = useState<IUpdateModal>(null);
  const [updateValueChain, setUpdateValueChain] = useState<IUpdateModal>(null);
  const [deleteValueChain, setDeleteValueChain] = useState<IDeleteModal>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { getBackUrl, setBackUrl } = useGoBackUrl();
  const { updateTitle } = useTitle();
  const { checkPermissions } = useAuth();
  const { toast } = useToast();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      product_id: apiConfig.filters.product?.id,
    };
  }, [apiConfig]);

  const {
    loading: valueChainsLoading,
    data: valueChainsData,
    error: valueChainsError,
    send: getValueChains,
  } = useGet<IPagingResult<IValueChain>>({
    url: '/value_chains',
    lazy: true,
  });

  const {
    loading: productsLoading,
    data: productsData,
    error: productsError,
    send: getProducts,
  } = useGet<IProduct[]>({
    url: '/products/limited/all',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterValueChainSchema>({
    resolver: yupResolver(filterValueChainSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getValueChains({ params: apiParams });
  }, [apiParams, getValueChains]);

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
    if (valueChainsError) {
      toast({ message: valueChainsError, severity: 'error' });

      return;
    }

    if (productsError) {
      toast({ message: productsError, severity: 'error' });
    }
  }, [valueChainsError, productsError, toast]);

  useEffect(() => {
    updateTitle('Cadeias de valor');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createValueChain: checkPermissions([
        [PermissionsUser.create_value_chain, PermissionsUser.manage_value_chain],
      ]),
      updateValueChain: checkPermissions([
        [PermissionsUser.update_value_chain, PermissionsUser.manage_value_chain],
      ]),
      deleteValueChain: checkPermissions([
        [PermissionsUser.delete_value_chain, PermissionsUser.manage_value_chain],
      ]),
      readTasks: checkPermissions([[PermissionsUser.read_task, PermissionsUser.manage_task]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const productsOptions = useMemo(() => {
    const options = !productsData
      ? []
      : productsData.map(({ id, pathString }) => ({ id, pathString }));

    if (apiConfig.filters.product) {
      const filter = options.find((product) => product.id === apiConfig.filters.product!.id);

      if (!filter) {
        options.push(apiConfig.filters.product as any);
      }
    }

    return options;
  }, [apiConfig.filters.product, productsData]);

  const handleApplyFilters = useCallback(
    (formData: IFilterValueChainSchema) => {
      const filtersValue = { ...formData, status_date: formData.status_date?.value || '' };

      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: filtersValue,
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'value_chains',
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
      key: 'value_chains',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const valueChainsFormatted = useMemo<IValueChainCardInfo[]>(() => {
    if (!valueChainsData) {
      return [];
    }

    return valueChainsData.data.map<IValueChainCardInfo>((valueChain) => {
      return {
        ...valueChain,
        status: getStatusText(valueChain.statusDate),
        statusColor: StatusDateColor[valueChain.statusDate.status],
        lateColor: valueChain.statusDate.late ? StatusDateColor.late : undefined,
      };
    });
  }, [valueChainsData]);

  const handleNavigateTasks = useCallback(
    (id: string) => {
      setBackUrl('tasks', location);

      navigate(`/tasks/graph/${id}`);
    },
    [location, navigate, setBackUrl],
  );

  if (valueChainsLoading) return <Loading loading={valueChainsLoading} />;

  return (
    <>
      {createValueChain && (
        <CreateValueChainModal
          openModal={createValueChain}
          closeModal={() => setCreateValueChain(false)}
          reloadList={() => getValueChains({ params: apiParams })}
          defaultProduct={apiConfig.filters.product}
        />
      )}

      {createValueChainTrail && (
        <CreateValueChainTrailModal
          openModal={createValueChainTrail}
          closeModal={() => setCreateValueChainTrail(false)}
          reloadList={() => getValueChains({ params: apiParams })}
          defaultProduct={apiConfig.filters.product}
        />
      )}

      {updateValueChain && (
        <UpdateValueChainModal
          openModal={!!updateValueChain}
          closeModal={() => setUpdateValueChain(null)}
          value_chain_id={updateValueChain.id}
          reloadList={() => getValueChains({ params: apiParams })}
        />
      )}

      {infoValueChain && (
        <InfoValueChainModal
          openModal={!!infoValueChain}
          closeModal={() => setInfoValueChain(null)}
          value_chain_id={infoValueChain.id}
        />
      )}

      {deleteValueChain && (
        <DeleteValueChainModal
          openModal={!!deleteValueChain}
          closeModal={() => setDeleteValueChain(null)}
          valueChain={deleteValueChain}
          reloadList={() => getValueChains({ params: apiParams })}
        />
      )}

      <ListValueChainContainer>
        <HeaderList
          id="value_chains"
          goBackUrl={getBackUrl('value_chains')}
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createValueChain && (
                <>
                  <CustomIconButton
                    action={() => setCreateValueChainTrail(true)}
                    title="Utilizar Trilha"
                    type="custom"
                    CustomIcon={
                      <LibraryAdd
                        sx={(theme) => ({
                          color: theme.palette.success.light,
                        })}
                      />
                    }
                  />

                  <CustomIconButton
                    action={() => setCreateValueChain(true)}
                    title="Cadastrar Cadeia de valor"
                    type="add"
                  />
                </>
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
                    key: 'value_chains',
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
                    key: 'value_chains',
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
                      options={statusDateNoLateOptions}
                      optionLabel="label"
                      errors={errors.status_date as any}
                    />
                  </Grid>

                  <Grid item lg={6} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="product"
                      label="Produto"
                      options={productsOptions}
                      optionLabel="pathString"
                      optionValue="id"
                      defaultValue={apiConfig.filters.product}
                      margin_type="no-margin"
                      errors={errors.product as any}
                      loading={productsLoading}
                      handleOpen={() => getProducts()}
                      handleFilter={(params) => getProducts(params)}
                      limitFilter={limitedProductLength}
                      filterField="name"
                      renderOption={(props, option: IProduct) => (
                        <CustomTooltip
                          key={option.id}
                          title={option.pathString}
                          text={
                            <Box {...props} key={option.id} component="li">
                              <TextEllipsis>{option.pathString}</TextEllipsis>
                            </Box>
                          }
                        />
                      )}
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
            totalPages: valueChainsData?.pagination.total_pages || 1,
            totalResults: valueChainsData?.pagination.total_results || 0,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        >
          <ValueChainList>
            {valueChainsFormatted.map((valueChain) => (
              <ValueChainCard
                key={valueChain.id}
                valueChain={valueChain}
                permissions={permissions}
                setInfo={(id) => setInfoValueChain({ id })}
                setUpdate={(id) => setUpdateValueChain({ id })}
                setDelete={(id, name) => setDeleteValueChain({ id, name })}
                handleNavigationTasks={handleNavigateTasks}
              />
            ))}
          </ValueChainList>
        </HeaderList>
      </ListValueChainContainer>
    </>
  );
}
