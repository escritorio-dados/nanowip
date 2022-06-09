import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';

import { ILinkFilters, linkStatesOptions } from '#modules/links/types/ILink';

export const defaultLinkFilter: ILinkFilters = {
  title: '',
  category: '',
  description: '',
  owner: '',
  state: { label: 'Ativos', value: 'active' },
  min_updated: null,
  max_updated: null,
};

export function ListLinksFilter({ apiConfig, ...props }: IListFilter<ILinkFilters>) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<ILinkFilters>();

  return (
    <FilterListForm
      defaultFilter={defaultLinkFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
      <Grid container spacing={2}>
        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="title"
            label="Titulo"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.title}
            errors={errors.title}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="category"
            label="Categoria"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.category}
            errors={errors.category}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="owner"
            label="Responsavel"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.owner}
            errors={errors.owner}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="description"
            label="Descrição"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.description}
            errors={errors.description}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormSelect
            control={control}
            name="state"
            label="Status"
            margin_type="no-margin"
            options={linkStatesOptions}
            optionLabel="label"
            optionValue="value"
            defaultValue={apiConfig.filters.state}
            errors={errors.state as any}
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
    </FilterListForm>
  );
}
