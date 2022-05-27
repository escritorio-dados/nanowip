import { yupResolver } from '@hookform/resolvers/yup';
import { ListAlt } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { FormDatePicker } from '#shared/components/form/FormDatePicker';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import {
  ICost,
  statusCostOptions,
  ICostDistributionFilter,
} from '#shared/types/backend/costs/ICost';
import {
  IDocumentType,
  limitedDocumentTypesLength,
} from '#shared/types/backend/costs/IDocumentType';
import { IService, limitedServicesLength } from '#shared/types/backend/costs/IService';
import {
  IServiceProvider,
  limitedServiceProvidersLength,
} from '#shared/types/backend/costs/IServiceProvider';
import { IProduct, limitedProductLength } from '#shared/types/backend/IProduct';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { InfoCostModal } from '#modules/costs/costs/components/InfoCost';

import { InfoCostDistributionsTaskModal } from '../../components/InfoCostDistributionCost';
import {
  filterCostDistributionSchema,
  IFilterCostDistributionSchema,
} from '../../schema/filterCostDistribution.schema';

type IUpdateModal = { id: string } | null;
type IDistributeModal = { id: string; name: string } | null;

type ICostFormatted = {
  id: string;
  reason: string;
  value: string;
  paymentDate: string;
  percentDistributed: string;
};

const defaultPaginationConfig: IPaginationConfig<ICostDistributionFilter> = {
  page: 1,
  sort_by: 'created_at',
  order_by: 'DESC',
  filters: {
    reason: '',
    description: '',
    documentNumber: '',
    documentType: null,
    product: null,
    service: null,
    serviceProvider: null,
    status: null,
    max_value: '',
    min_value: '',
    max_percent: '',
    min_percent: '',
    max_due: null,
    min_due: null,
    max_issue: null,
    min_issue: null,
    max_payment: null,
    min_payment: null,
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  reason: 'Motivo',
  value: 'Valor',
  description: 'Descrição',
  product: 'Produto',
  service: 'Serviço',
  percent_distributed: 'Distribuição dos Custos',
  document_number: 'Numero do Documento',
  document_type: 'Tipo de Documento',
  service_provider: 'Provedor de Serviço',
  issue_date: 'Data de Lançamento',
  due_date: 'Data de Vencimento',
  payment_date: 'Data de Pagamento',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListCostDistributions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICostDistributionFilter>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<ICostDistributionFilter>({
      category: 'filters',
      key: 'cost_distributions',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'cost_distributions',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'cost_distributions',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'cost_distributions',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [infoCost, setInfoCost] = useState<IUpdateModal>(null);
  const [infoCostDistribution, setInfoCostDistribution] = useState<IDistributeModal>(null);

  const { getBackUrl } = useGoBackUrl();
  const { toast } = useToast();
  const { updateTitle } = useTitle();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      document_number: apiConfig.filters.documentNumber,
      document_type_id: apiConfig.filters.documentType?.id,
      service_provider_id: apiConfig.filters.serviceProvider?.id,
      product_id: apiConfig.filters.product?.id,
      service_id: apiConfig.filters.service?.id,
      status: apiConfig.filters.status?.value,
    };
  }, [apiConfig]);

  const {
    loading: costsLoading,
    data: costsData,
    error: costsError,
    send: getCosts,
  } = useGet<IPagingResult<ICost>>({
    url: '/costs/distribution',
    lazy: true,
  });

  const {
    loading: serviceProvidersLoading,
    data: serviceProvidersData,
    error: serviceProvidersError,
    send: getServiceProviders,
  } = useGet<IServiceProvider[]>({
    url: '/service_providers/limited',
    lazy: true,
  });

  const {
    loading: documentTypesLoading,
    data: documentTypesData,
    error: documentTypesError,
    send: getDocumentTypes,
  } = useGet<IDocumentType[]>({
    url: '/document_types/limited',
    lazy: true,
  });

  const {
    loading: servicesLoading,
    data: servicesData,
    error: servicesError,
    send: getServices,
  } = useGet<IService[]>({
    url: '/services/limited',
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
  } = useForm<IFilterCostDistributionSchema>({
    resolver: yupResolver(filterCostDistributionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getCosts({ params: apiParams });
  }, [apiParams, getCosts]);

  useEffect(() => {
    if (costsError) {
      toast({ message: costsError, severity: 'error' });

      return;
    }

    if (serviceProvidersError) {
      toast({ message: serviceProvidersError, severity: 'error' });

      return;
    }

    if (servicesError) {
      toast({ message: servicesError, severity: 'error' });

      return;
    }

    if (productsError) {
      toast({ message: productsError, severity: 'error' });

      return;
    }

    if (documentTypesError) {
      toast({ message: documentTypesError, severity: 'error' });
    }
  }, [costsError, toast, serviceProvidersError, documentTypesError, servicesError, productsError]);

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
    updateTitle('Distribuição dos Custos');
  }, [updateTitle]);

  const serviceProvidersOptions = useMemo(() => {
    const options = !serviceProvidersData ? [] : serviceProvidersData;

    if (apiConfig.filters.serviceProvider) {
      const filter = options.find((option) => option.id === apiConfig.filters.serviceProvider!.id);

      if (!filter) {
        options.push(apiConfig.filters.serviceProvider as any);
      }
    }

    return options;
  }, [apiConfig, serviceProvidersData]);

  const documentTypesOptions = useMemo(() => {
    const options = !documentTypesData ? [] : documentTypesData;

    if (apiConfig.filters.documentType) {
      const filter = options.find((option) => option.id === apiConfig.filters.documentType!.id);

      if (!filter) {
        options.push(apiConfig.filters.documentType as any);
      }
    }

    return options;
  }, [apiConfig, documentTypesData]);

  const servicesOptions = useMemo(() => {
    const options = !servicesData ? [] : servicesData;

    if (apiConfig.filters.service) {
      const filter = options.find((option) => option.id === apiConfig.filters.service!.id);

      if (!filter) {
        options.push(apiConfig.filters.service as any);
      }
    }

    return options;
  }, [apiConfig, servicesData]);

  const productsOptions = useMemo(() => {
    const options = !productsData ? [] : productsData;

    if (apiConfig.filters.product) {
      const filter = options.find((option) => option.id === apiConfig.filters.product!.id);

      if (!filter) {
        options.push(apiConfig.filters.product as any);
      }
    }

    return options;
  }, [apiConfig, productsData]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleApplyFilters = useCallback(
    (formData: IFilterCostDistributionSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'cost_distributions',
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

    resetForm(defaultPaginationConfig.filters as any);

    updateState({
      category: 'filters',
      key: 'cost_distributions',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const data = useMemo<ICostFormatted[]>(() => {
    if (!costsData) {
      return [];
    }

    return costsData.data.map<ICostFormatted>((cost) => {
      const percent = `${Math.round((cost.percentDistributed || 0) * 100)}%`;

      return {
        ...cost,
        percentDistributed: percent,
        paymentDate: parseDateApi(cost.paymentDate, 'dd/MM/yyyy', '-'),
        value: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
          cost.value,
        ),
      };
    });
  }, [costsData]);

  const cols = useMemo<ICol<ICostFormatted>[]>(() => {
    return [
      {
        key: 'reason',
        header: 'Motivo',
        minWidth: '200px',
        maxWidth: '400px',
        customColumn: ({ reason }) => {
          return (
            <>
              <CustomTooltip title={reason}>{reason}</CustomTooltip>
            </>
          );
        },
      },
      { key: 'value', header: 'Valor', minWidth: '120px', maxWidth: '150px' },
      { key: 'paymentDate', header: 'Pagamento', maxWidth: '120px' },
      { key: 'percentDistributed', header: '% Distribuida', maxWidth: '120px' },
      {
        header: 'Opções',
        maxWidth: '100px',
        customColumn: ({ id, reason }) => {
          return (
            <div style={{ display: 'flex', position: 'relative' }}>
              <CustomIconButton
                type="custom"
                size="small"
                title="Distribuir Custo"
                CustomIcon={<ListAlt fontSize="small" color="success" />}
                action={() => {
                  setInfoCostDistribution({ id, name: reason });
                }}
              />

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoCost({ id })}
              />
            </div>
          );
        },
      },
    ];
  }, []);

  if (costsLoading) return <Loading loading={costsLoading} />;

  return (
    <>
      {!!infoCost && (
        <InfoCostModal
          openModal={!!infoCost}
          closeModal={() => setInfoCost(null)}
          cost_id={infoCost.id}
        />
      )}

      {!!infoCostDistribution && (
        <InfoCostDistributionsTaskModal
          openModal={!!infoCostDistribution}
          closeModal={(reload) => {
            setInfoCostDistribution(null);

            if (reload) {
              getCosts({ params: apiParams });
            }
          }}
          cost={infoCostDistribution}
        />
      )}

      {costsData && (
        <CustomTable<ICostFormatted>
          id="costs"
          goBackUrl={getBackUrl('costs')}
          cols={cols}
          data={data}
          activeFilters={activeFiltersNumber}
          tableMinWidth="600px"
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
                    key: 'cost_distributions',
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
                    key: 'cost_distributions',
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
                      name="reason"
                      label="Motivo"
                      control={control}
                      errors={errors.reason}
                      defaultValue={apiConfig.filters.reason}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      name="description"
                      label="Descrição"
                      control={control}
                      errors={errors.description}
                      defaultValue={apiConfig.filters.description}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      name="documentNumber"
                      label="Numero do Documento"
                      control={control}
                      errors={errors.documentNumber}
                      defaultValue={apiConfig.filters.documentNumber}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      margin_type="no-margin"
                      name="documentType"
                      label="Tipo de Documento"
                      options={documentTypesOptions}
                      filterField="name"
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.documentType}
                      errors={errors.documentType as any}
                      loading={documentTypesLoading}
                      handleOpen={() => getDocumentTypes()}
                      handleFilter={(params) => getDocumentTypes(params)}
                      limitFilter={limitedDocumentTypesLength}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      margin_type="no-margin"
                      name="serviceProvider"
                      label="Prestador do serviço"
                      options={serviceProvidersOptions}
                      filterField="name"
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.serviceProvider}
                      errors={errors.serviceProvider as any}
                      loading={serviceProvidersLoading}
                      handleOpen={() => getServiceProviders()}
                      handleFilter={(params) => getServiceProviders(params)}
                      limitFilter={limitedServiceProvidersLength}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      margin_type="no-margin"
                      name="status"
                      label="Status"
                      options={statusCostOptions}
                      optionLabel="label"
                      optionValue="value"
                      errors={errors.status as any}
                      defaultValue={apiConfig.filters.status}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      name="min_value"
                      label="Valor (Min)"
                      control={control}
                      errors={errors.min_value}
                      defaultValue={apiConfig.filters.min_value}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      name="max_value"
                      label="Valor (Max)"
                      control={control}
                      errors={errors.max_value}
                      defaultValue={apiConfig.filters.max_value}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDatePicker
                      control={control}
                      name="min_issue"
                      label="Data de Lançamento (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_issue}
                      errors={errors.min_issue}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDatePicker
                      control={control}
                      name="max_issue"
                      label="Data de Lançamento (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_issue}
                      errors={errors.max_issue}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDatePicker
                      control={control}
                      name="min_due"
                      label="Data de Vencimento (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_due}
                      errors={errors.min_due}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDatePicker
                      control={control}
                      name="max_due"
                      label="Data de Vencimento (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_due}
                      errors={errors.max_due}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDatePicker
                      control={control}
                      name="min_payment"
                      label="Data de Pagamento (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_payment}
                      errors={errors.min_payment}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDatePicker
                      control={control}
                      name="max_payment"
                      label="Data de Pagamento (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_payment}
                      errors={errors.max_payment}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_updated"
                      label="Data de Atualização (Minima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_updated}
                      errors={errors.min_updated}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_updated"
                      label="Data de Atualização (Maxima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_updated}
                      errors={errors.max_updated}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      margin_type="no-margin"
                      name="service"
                      label="Serviço"
                      options={servicesOptions}
                      filterField="name"
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.service}
                      errors={errors.service as any}
                      loading={servicesLoading}
                      handleOpen={() => getServices()}
                      handleFilter={(params) => getServices(params)}
                      limitFilter={limitedServicesLength}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      margin_type="no-margin"
                      name="product"
                      label="Produto"
                      options={productsOptions}
                      filterField="name"
                      optionLabel="pathString"
                      optionValue="id"
                      defaultValue={apiConfig.filters.product}
                      errors={errors.product as any}
                      loading={productsLoading}
                      handleOpen={() => getProducts()}
                      handleFilter={(params) => getProducts(params)}
                      limitFilter={limitedProductLength}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      name="min_percent"
                      label="Porcentagem (Min)"
                      control={control}
                      errors={errors.min_percent}
                      defaultValue={apiConfig.filters.min_percent}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      name="max_percent"
                      label="Porcentagem (Max)"
                      control={control}
                      errors={errors.max_percent}
                      defaultValue={apiConfig.filters.max_percent}
                      margin_type="no-margin"
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
            totalPages: costsData.pagination.total_pages,
            totalResults: costsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
