import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormTextField } from '#shared/components/form/FormTextField';

import { ITaskTypeFilters } from '../../types/ITaskType';

export const defaultTaskTypeFilter: ITaskTypeFilters = {
  name: '',
  min_updated: null,
  max_updated: null,
};

export function ListTaskTypesFilter({ apiConfig, ...props }: IListFilter<ITaskTypeFilters>) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<ITaskTypeFilters>();

  return (
    <FilterListForm
      defaultFilter={defaultTaskTypeFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormTextField
            control={control}
            name="name"
            label="Nome"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.name}
            errors={errors.name}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormDateTimePicker
            control={control}
            name="min_updated"
            label="Data de Atualização (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_updated}
            errors={errors.min_updated}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
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
