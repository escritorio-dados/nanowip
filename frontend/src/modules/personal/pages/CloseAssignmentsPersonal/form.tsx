import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormTextField } from '#shared/components/form/FormTextField';

import { ICloseAssignmentsPersonalFilters } from '#modules/assignments/types/IAssignment';

export const defaultCloseAssignmentFilter: ICloseAssignmentsPersonalFilters = {
  task: '',
  local: '',
  min_end: null,
  max_end: null,
  min_updated: null,
  max_updated: null,
};

export function ListCloseAssignmentsFilter({
  apiConfig,
  ...props
}: IListFilter<ICloseAssignmentsPersonalFilters>) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<ICloseAssignmentsPersonalFilters>();

  return (
    <FilterListForm
      defaultFilter={defaultCloseAssignmentFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
      <Grid container spacing={2}>
        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="task"
            label="Tarefa"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.task}
            errors={errors.task}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="local"
            label="Local"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.local}
            errors={errors.local}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="min_end"
            label="Data de Término (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_end}
            errors={errors.min_end}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="max_end"
            label="Data de Término (Max)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_end}
            errors={errors.max_end}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="min_updated"
            label="Data de Atualização (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_updated}
            errors={errors.min_updated}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
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
