import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { statusDateOptions } from '#shared/types/IStatusDate';

import { ICustomer, limitedCustomersLength } from '#modules/customers/types/ICustomer';
import { IPortfolio, limitedPortfoliosLength } from '#modules/portfolios/types/IPortfolio';
import {
  IProjectType,
  limitedProjectTypesLength,
} from '#modules/projects/projectTypes/types/IProjectType';

import { IProjectFilters } from '../../types/IProject';

export const defaultProjectFilter: IProjectFilters = {
  name: '',
  status_date: null,
  project_type: null,
  portfolio: null,
  customer: null,
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
};

export function ListProjectsFilter({ apiConfig, ...props }: IListFilter<IProjectFilters>) {
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IProjectFilters>();

  const {
    loading: customersLoading,
    data: customersData,
    error: customersError,
    send: getCustomers,
  } = useGet<ICustomer[]>({
    url: '/customers/limited',
    lazy: true,
  });

  const {
    loading: portfoliosLoading,
    data: portfoliosData,
    error: portfoliosError,
    send: getPortfolios,
  } = useGet<IPortfolio[]>({
    url: '/portfolios/limited',
    lazy: true,
  });

  const {
    loading: projectTypesLoading,
    data: projectTypesData,
    error: projectTypesError,
    send: getProjectTypes,
  } = useGet<IProjectType[]>({
    url: '/project_types/limited',
    lazy: true,
  });

  useEffect(() => {
    if (customersError) {
      toast({ message: customersError, severity: 'error' });

      return;
    }

    if (projectTypesError) {
      toast({ message: projectTypesError, severity: 'error' });

      return;
    }

    if (portfoliosError) {
      toast({ message: portfoliosError, severity: 'error' });
    }
  }, [customersError, toast, projectTypesError, portfoliosError]);

  const customersOptions = useMemo(() => {
    const options = !customersData ? [] : customersData;

    if (apiConfig.filters.customer) {
      const filter = options.find((customer) => customer.id === apiConfig.filters.customer!.id);

      if (!filter) {
        options.push(apiConfig.filters.customer as any);
      }
    }

    return options;
  }, [apiConfig.filters.customer, customersData]);

  const portfoliosOptions = useMemo(() => {
    const options = !portfoliosData ? [] : portfoliosData;

    if (apiConfig.filters.portfolio) {
      const filter = options.find((portfolio) => portfolio.id === apiConfig.filters.portfolio!.id);

      if (!filter) {
        options.push(apiConfig.filters.portfolio as any);
      }
    }

    return options;
  }, [apiConfig.filters.portfolio, portfoliosData]);

  const projectTypesOptions = useMemo(() => {
    const options = !projectTypesData ? [] : projectTypesData;

    if (apiConfig.filters.project_type) {
      const filter = options.find(
        (project_type) => project_type.id === apiConfig.filters.project_type!.id,
      );

      if (!filter) {
        options.push(apiConfig.filters.project_type as any);
      }
    }

    return options;
  }, [apiConfig.filters.project_type, projectTypesData]);

  return (
    <FilterListForm
      defaultFilter={defaultProjectFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
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
            defaultValue={apiConfig.filters.status_date}
            options={statusDateOptions}
            optionLabel="label"
            optionValue="value"
            errors={errors.status_date as any}
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormSelectAsync
            control={control}
            name="customer"
            label="Cliente"
            options={customersOptions}
            optionLabel="name"
            optionValue="id"
            defaultValue={apiConfig.filters.customer}
            margin_type="no-margin"
            errors={errors.customer as any}
            loading={customersLoading}
            handleOpen={() => getCustomers()}
            handleFilter={(params) => getCustomers(params)}
            limitFilter={limitedCustomersLength}
            filterField="name"
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormSelectAsync
            control={control}
            name="portfolio"
            label="Portfolio"
            options={portfoliosOptions}
            optionLabel="name"
            optionValue="id"
            defaultValue={apiConfig.filters.portfolio}
            margin_type="no-margin"
            errors={errors.portfolio as any}
            loading={portfoliosLoading}
            handleOpen={() => getPortfolios()}
            handleFilter={(params) => getPortfolios(params)}
            limitFilter={limitedPortfoliosLength}
            filterField="name"
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormSelectAsync
            control={control}
            name="project_type"
            label="Tipo de Projeto"
            options={projectTypesOptions}
            optionLabel="name"
            optionValue="id"
            defaultValue={apiConfig.filters.project_type}
            margin_type="no-margin"
            errors={errors.project_type as any}
            loading={projectTypesLoading}
            handleOpen={() => getProjectTypes()}
            handleFilter={(params) => getProjectTypes(params)}
            limitFilter={limitedProjectTypesLength}
            filterField="name"
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
    </FilterListForm>
  );
}
