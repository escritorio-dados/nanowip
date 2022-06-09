import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDatePicker } from '#shared/components/form/FormDatePicker';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';

import {
  IDocumentType,
  limitedDocumentTypesLength,
} from '#modules/costs/documentTypes/types/IDocumentType';
import {
  IServiceProvider,
  limitedServiceProvidersLength,
} from '#modules/costs/serviceProviders/types/IServiceProvider';

import { filterCostSchema } from '../../schema/filterCost.schema';
import { ICostFilters, statusCostOptions } from '../../types/ICost';

export const defaultCostFilter: ICostFilters = {
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
};

export function ListCostsFilter({ apiConfig, ...props }: IListFilter<ICostFilters>) {
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<ICostFilters>({
    resolver: yupResolver(filterCostSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
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

  useEffect(() => {
    if (serviceProvidersError) {
      toast({ message: serviceProvidersError, severity: 'error' });

      return;
    }

    if (documentTypesError) {
      toast({ message: documentTypesError, severity: 'error' });
    }
  }, [toast, serviceProvidersError, documentTypesError]);

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

  return (
    <FilterListForm
      defaultFilter={defaultCostFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
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
    </FilterListForm>
  );
}
