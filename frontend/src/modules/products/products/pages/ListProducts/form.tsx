import { yupResolver } from '@hookform/resolvers/yup';
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

import { IMeasure, limitedMeasuresLength } from '#modules/products/measures/types/IMeasure';
import {
  IProductType,
  limitedProductTypesLength,
} from '#modules/products/productTypes/types/IProductType';
import { IProject, limitedProjectsLength } from '#modules/projects/projects/types/IProject';

import { filterProductSchema } from '../../schemas/filterProduct.schema';
import { IProductFilters } from '../../types/IProduct';

export const defaultProductFilter: IProductFilters = {
  name: '',
  project: null,
  status_date: null,
  product_type: null,
  measure: null,
  min_quantity: '',
  max_quantity: '',
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

export function ListProductsFilter({ apiConfig, ...props }: IListFilter<IProductFilters>) {
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IProductFilters>({
    resolver: yupResolver(filterProductSchema),
    reValidateMode: 'onBlur',
    mode: 'onBlur',
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

  useEffect(() => {
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
  }, [toast, productTypesError, projectsError, measuresError]);

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

  return (
    <FilterListForm
      defaultFilter={defaultProductFilter}
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
    </FilterListForm>
  );
}
