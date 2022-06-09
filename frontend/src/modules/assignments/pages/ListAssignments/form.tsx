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
import { statusDateOptions } from '#shared/types/IStatusDate';

import { IAssignmentFilters } from '#modules/assignments/types/IAssignment';
import {
  ICollaborator,
  limitedCollaboratorsLength,
} from '#modules/collaborators/collaborators/types/ICollaborator';

export const defaultAssignmentFilter: IAssignmentFilters = {
  collaborator: null,
  in_progress: false,
  task: '',
  local: '',
  status: null,
  status_date: null,
  max_start: null,
  min_start: null,
  min_end: null,
  max_end: null,
  min_deadline: null,
  max_deadline: null,
  min_updated: null,
  max_updated: null,
};

export function ListAssignmentsFilter({ apiConfig, ...props }: IListFilter<IAssignmentFilters>) {
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IAssignmentFilters>();

  const {
    loading: collaboratorsLoading,
    data: collaboratorsData,
    error: collaboratorsError,
    send: getCollaborators,
  } = useGet<ICollaborator[]>({
    url: '/collaborators/limited',
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
      defaultFilter={defaultAssignmentFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
      <Grid container spacing={2}>
        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormTextField
            control={control}
            name="task"
            label="Tarefa"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.task}
            errors={errors.task}
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormTextField
            control={control}
            name="local"
            label="Local"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.local}
            errors={errors.local}
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
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

        <Grid item lg={3} md={4} sm={6} xs={12}>
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

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormSelect
            control={control}
            name="status_date"
            label="Status (Data)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.status_date}
            options={statusDateOptions}
            optionLabel="label"
            errors={errors.status_date as any}
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="min_start"
            label="Data de Inicio (Minima)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_start}
            errors={errors.min_start}
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="max_start"
            label="Data de Inicio (Maxima)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_start}
            errors={errors.max_start}
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="min_end"
            label="Data de Término (Minima)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_end}
            errors={errors.min_end}
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="max_end"
            label="Data de Término (Maxima)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_end}
            errors={errors.max_end}
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="min_deadline"
            label="Prazo (Minima)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_deadline}
            errors={errors.min_deadline}
          />
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="max_deadline"
            label="Prazo (Maxima)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_deadline}
            errors={errors.max_deadline}
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

        <Grid item lg={3} md={4} sm={6} xs={12}>
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
