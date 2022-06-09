import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormCheckbox } from '#shared/components/form/FormCheck';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { statusDateOptions } from '#shared/types/IStatusDate';

import {
  IProductType,
  limitedProductTypesLength,
} from '#modules/products/productTypes/types/IProductType';
import { IProject, limitedProjectsLength } from '#modules/projects/projects/types/IProject';

import { filterProductSchema } from '../../schemas/filterProduct.schema';
import { IProductReportFilters } from '../../types/IProduct';

export const defaultProductReportFilter: IProductReportFilters = {
  name: '',
  status_date: null,
  product_type: null,
  project: null,
  includeAvailable: true,
  includeFirst: false,
  includeLast: false,
};

export function ListProductsReportFilter({
  apiConfig,
  ...props
}: IListFilter<IProductReportFilters>) {
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IProductReportFilters>({
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

  useEffect(() => {
    if (projectsError) {
      toast({ message: projectsError, severity: 'error' });

      return;
    }

    if (productTypesError) {
      toast({ message: productTypesError, severity: 'error' });
    }
  }, [toast, productTypesError, projectsError]);

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

  return (
    <FilterListForm
      defaultFilter={defaultProductReportFilter}
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
          <FormCheckbox
            control={control}
            name="includeAvailable"
            label="Incluir Tarefas Disponiveis"
            defaultValue={apiConfig.filters.includeAvailable}
            margin_type="no-margin"
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormCheckbox
            control={control}
            name="includeFirst"
            label="Incluir Primeira Tarefa"
            defaultValue={apiConfig.filters.includeFirst}
            margin_type="no-margin"
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormCheckbox
            control={control}
            name="includeLast"
            label="Incluir Ultima Tarefa"
            defaultValue={apiConfig.filters.includeLast}
            margin_type="no-margin"
          />
        </Grid>
      </Grid>
    </FilterListForm>
  );
}
