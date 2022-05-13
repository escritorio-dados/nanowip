import { yupResolver } from '@hookform/resolvers/yup';
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
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICost, ICostFilter, statusCostOptions } from '#shared/types/backend/costs/ICost';
import {
  IDocumentType,
  limitedDocumentTypesLength,
} from '#shared/types/backend/costs/IDocumentType';
import {
  IServiceProvider,
  limitedServiceProvidersLength,
} from '#shared/types/backend/costs/IServiceProvider';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateCostModal } from '../../components/CreateCost';
import { DeleteCostModal } from '../../components/DeleteCost';
import { InfoCostModal } from '../../components/InfoCost';
import { UpdateCostModal } from '../../components/UpdateCost';
import { filterCostSchema, IFilterCostSchema } from '../../schema/filterCost.schema';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

type ICostFormatted = {
  id: string;
  reason: string;
  value: string;
  paymentDate: string;
  serviceProvider: string;
  status: string;
};

const defaultPaginationConfig: IPaginationConfig<ICostFilter> = {
  page: 1,
  sort_by: 'created_at',
  order_by: 'DESC',
  filters: {
    reason: '',
    description: '',
    documentNumber: '',
    documentType: null,
    serviceProvider: null,
    status: null,
    max_value: '',
    min_value: '',
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

export function ListCost() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICostFilter>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<ICostFilter>({
      category: 'filters',
      key: 'costs',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'costs',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'costs',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'costs',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteCost, setDeleteCost] = useState<IDeleteModal>(null);
  const [updateCost, setUpdateCost] = useState<IUpdateModal>(null);
  const [createCost, setCreateCost] = useState(false);
  const [infoCost, setInfoCost] = useState<IUpdateModal>(null);

  const { getBackUrl } = useGoBackUrl();
  const { toast } = useToast();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      document_type_id: apiConfig.filters.documentType?.id,
      service_provider_id: apiConfig.filters.serviceProvider?.id,
      status: apiConfig.filters.status?.value,
    };
  }, [apiConfig]);

  const {
    loading: costsLoading,
    data: costsData,
    error: costsError,
    send: getCosts,
  } = useGet<IPagingResult<ICost>>({
    url: '/costs',
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
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterCostSchema>({
    resolver: yupResolver(filterCostSchema),
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

    if (documentTypesError) {
      toast({ message: documentTypesError, severity: 'error' });
    }
  }, [costsError, toast, serviceProvidersError, documentTypesError]);

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
    updateTitle('Custos');
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

  const permissions = useMemo(() => {
    return {
      createCost: checkPermissions([[PermissionsUser.create_cost, PermissionsUser.manage_cost]]),
      updateCost: checkPermissions([[PermissionsUser.update_cost, PermissionsUser.manage_cost]]),
      deleteCost: checkPermissions([[PermissionsUser.delete_cost, PermissionsUser.manage_cost]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleApplyFilters = useCallback(
    (formData: IFilterCostSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'costs',
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
      key: 'costs',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const data = useMemo<ICostFormatted[]>(() => {
    if (!costsData) {
      return [];
    }

    return costsData.data.map<ICostFormatted>((cost) => ({
      ...cost,
      paymentDate: parseDateApi(cost.paymentDate, 'dd/MM/yyyy', '-'),
      value: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
        cost.value,
      ),
      serviceProvider: cost.serviceProvider?.name || '',
    }));
  }, [costsData]);

  const cols = useMemo<ICol<ICostFormatted>[]>(() => {
    return [
      { key: 'serviceProvider', header: 'Prestador do Serviço', minWidth: '200px' },
      {
        key: 'reason',
        header: 'Motivo',
        minWidth: '200px',
        maxWidth: '400px',
        customColumn: ({ reason }) => {
          return (
            <>
              <CustomTooltip title={reason} text={reason} />
            </>
          );
        },
      },
      { key: 'value', header: 'Valor', minWidth: '120px' },
      { key: 'paymentDate', header: 'Pagamento', maxWidth: '120px' },
      { key: 'status', header: 'Status', minWidth: '100px' },
      {
        header: 'Opções',
        maxWidth: '170px',
        customColumn: ({ id, reason }) => {
          return (
            <div style={{ display: 'flex', position: 'relative' }}>
              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoCost({ id })}
              />

              {permissions.updateCost && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Custo"
                  action={() => setUpdateCost({ id })}
                />
              )}

              {permissions.deleteCost && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Custo"
                  action={() => setDeleteCost({ id, name: reason })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [permissions.deleteCost, permissions.updateCost]);

  if (costsLoading) return <Loading loading={costsLoading} />;

  return (
    <>
      {createCost && (
        <CreateCostModal
          openModal={createCost}
          closeModal={() => setCreateCost(false)}
          reloadList={() => getCosts({ params: apiParams })}
        />
      )}

      {!!deleteCost && (
        <DeleteCostModal
          openModal={!!deleteCost}
          closeModal={() => setDeleteCost(null)}
          reloadList={() => getCosts({ params: apiParams })}
          cost={deleteCost}
        />
      )}

      {!!updateCost && (
        <UpdateCostModal
          openModal={!!updateCost}
          closeModal={() => setUpdateCost(null)}
          cost_id={updateCost.id}
          reloadList={() => getCosts({ params: apiParams })}
        />
      )}

      {!!infoCost && (
        <InfoCostModal
          openModal={!!infoCost}
          closeModal={() => setInfoCost(null)}
          cost_id={infoCost.id}
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
          custom_actions={
            <>
              {permissions.createCost && (
                <CustomIconButton
                  action={() => setCreateCost(true)}
                  title="Cadastrar Custo"
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
                    key: 'costs',
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
                    key: 'costs',
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
