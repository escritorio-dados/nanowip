import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormCheckbox } from '#shared/components/form/FormCheck';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';

import { ITrackerFiltersPersonal } from '#modules/trackers/types/ITracker';

export const defaultPersonalTrackersFilter: ITrackerFiltersPersonal = {
  in_progress: false,
  task: '',
  local: '',
  reason: '',
  status: null,
  type: null,
  max_start: null,
  min_start: null,
  min_end: null,
  max_end: null,
  min_updated: null,
  max_updated: null,
};

export function ListPersonalTrackersFilter({
  apiConfig,
  ...props
}: IListFilter<ITrackerFiltersPersonal>) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<ITrackerFiltersPersonal>();

  return (
    <FilterListForm
      defaultFilter={defaultPersonalTrackersFilter}
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
          <FormTextField
            control={control}
            name="reason"
            label="Motivo"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.reason}
            errors={errors.reason}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormSelect
            control={control}
            name="status"
            label="Status"
            options={['Aberto', 'Fechado']}
            defaultValue={apiConfig.filters.status}
            errors={errors.status}
            margin_type="no-margin"
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormSelect
            control={control}
            name="type"
            label="Tipo"
            options={['Vinculado', 'Solto']}
            defaultValue={apiConfig.filters.type}
            errors={errors.type}
            margin_type="no-margin"
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="min_start"
            label="Data de Inicio (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_start}
            errors={errors.min_start}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="max_start"
            label="Data de Inicio (Max)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_start}
            errors={errors.max_start}
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

        <Grid item sm={6} xs={12}>
          <FormCheckbox
            control={control}
            name="in_progress"
            label="Em Andamento Agora"
            defaultValue={apiConfig.filters.in_progress}
            margin_type="no-margin"
          />
        </Grid>
      </Grid>
    </FilterListForm>
  );
}
