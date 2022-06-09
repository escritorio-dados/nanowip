import { Box, Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomTooltip } from '#shared/components/CustomTooltip';
import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { statusDateNoLateOptions } from '#shared/types/IStatusDate';

import { IProduct, limitedProductLength } from '#modules/products/products/types/IProduct';

import { IValueChainFilters } from '../../types/IValueChain';

export const defaultValueChainFilter: IValueChainFilters = {
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
};

export function ListValueChainsFilter({ apiConfig, ...props }: IListFilter<IValueChainFilters>) {
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IValueChainFilters>();

  const {
    loading: productsLoading,
    data: productsData,
    error: productsError,
    send: getProducts,
  } = useGet<IProduct[]>({
    url: '/products/limited/all',
    lazy: true,
  });

  useEffect(() => {
    if (productsError) {
      toast({ message: productsError, severity: 'error' });
    }
  }, [toast, productsError]);

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

  return (
    <FilterListForm
      defaultFilter={defaultValueChainFilter}
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
            renderOption={(propsOption, option: IProduct) => (
              <CustomTooltip key={option.id} title={option.pathString}>
                <Box {...propsOption} key={option.id} component="li">
                  <TextEllipsis>{option.pathString}</TextEllipsis>
                </Box>
              </CustomTooltip>
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
    </FilterListForm>
  );
}
