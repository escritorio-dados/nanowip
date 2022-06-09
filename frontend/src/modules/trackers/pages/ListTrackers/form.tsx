import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormCheckbox } from '#shared/components/form/FormCheck';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';

import {
  ICollaborator,
  limitedCollaboratorsLength,
} from '#modules/collaborators/collaborators/types/ICollaborator';
import { ITrackerFilters } from '#modules/trackers/types/ITracker';

export const defaultTrackerFilter: ITrackerFilters = {
  collaborator: null,
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

export function ListTrackersFilter({ apiConfig, ...props }: IListFilter<ITrackerFilters>) {
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<ITrackerFilters>();

  const {
    loading: collaboratorsLoading,
    data: collaboratorsData,
    error: collaboratorsError,
    send: getCollaborators,
  } = useGet<ICollaborator[]>({
    url: '/collaborators/limited/trackers',
    lazy: true,
  });

  useEffect(() => {
    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });
    }
  }, [toast, collaboratorsError]);

  const collaboratorsOptions = useMemo(() => {
    const options = !collaboratorsData ? [] : collaboratorsData;

    if (apiConfig.filters.collaborator) {
      const filter = options.find(
        (collaborator) => collaborator.id === apiConfig.filters.collaborator!.id,
      );

      if (!filter) {
        options.push(apiConfig.filters.collaborator as any);
      }
    }

    return options;
  }, [apiConfig.filters.collaborator, collaboratorsData]);

  return (
    <FilterListForm
      defaultFilter={defaultTrackerFilter}
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
          <FormSelectAsync
            control={control}
            name="collaborator"
            label="Colaborador"
            options={collaboratorsOptions}
            defaultValue={apiConfig.filters.collaborator}
            limitFilter={limitedCollaboratorsLength}
            optionLabel="name"
            optionValue="id"
            filterField="name"
            errors={errors.collaborator as any}
            loading={collaboratorsLoading}
            handleOpen={() => getCollaborators()}
            handleFilter={(params) => getCollaborators(params)}
            margin_type="no-margin"
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
