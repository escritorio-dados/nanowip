import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDatePicker } from '#shared/components/form/FormDatePicker';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';

import {
  ICollaborator,
  limitedCollaboratorsLength,
} from '#modules/collaborators/collaborators/types/ICollaborator';
import { ICollaboratorStatusFilters } from '#modules/collaborators/collaboratorsStatus/types/ICollaboratorStatus';

import { filterCollaboratorStatusSchema } from '../../schema/filterCollaboratorStatus.schema';

export const defaultCollaboratorStatusFilter: ICollaboratorStatusFilters = {
  collaborator: null,
  max_date: null,
  min_date: null,
  max_month_hours: '',
  min_month_hours: '',
  max_salary: '',
  min_salary: '',
  min_updated: null,
  max_updated: null,
};

export function ListCollaboratorStatussFilter({
  apiConfig,
  ...props
}: IListFilter<ICollaboratorStatusFilters>) {
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<ICollaboratorStatusFilters>({
    resolver: yupResolver(filterCollaboratorStatusSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

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
  }, [collaboratorsError, toast]);

  const collaboratorsOptions = useMemo(() => {
    const options = !collaboratorsData ? [] : collaboratorsData;

    if (apiConfig.filters.collaborator) {
      const filter = options.find((project) => project.id === apiConfig.filters.collaborator!.id);

      if (!filter) {
        options.push(apiConfig.filters.collaborator as any);
      }
    }

    return options;
  }, [apiConfig.filters.collaborator, collaboratorsData]);

  return (
    <FilterListForm
      defaultFilter={defaultCollaboratorStatusFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
      <Grid container spacing={2}>
        <Grid item sm={6} xs={12}>
          <FormSelectAsync
            control={control}
            margin_type="no-margin"
            name="collaborator"
            label="Colaborador"
            options={collaboratorsOptions}
            optionLabel="name"
            optionValue="id"
            defaultValue={apiConfig.filters.collaborator}
            errors={errors.collaborator as any}
            loading={collaboratorsLoading}
            handleOpen={() => getCollaborators()}
            handleFilter={(params) => getCollaborators(params)}
            limitFilter={limitedCollaboratorsLength}
            filterField="name"
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormDatePicker
            control={control}
            name="min_date"
            label="Data (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_date}
            errors={errors.min_date}
            customView={['year', 'month']}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormDatePicker
            control={control}
            name="max_date"
            label="Data (Max)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_date}
            errors={errors.max_date}
            customView={['year', 'month']}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="min_salary"
            label="Salario (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_salary}
            errors={errors.min_salary}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="max_salary"
            label="Salario (Max)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_salary}
            errors={errors.max_salary}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="min_month_hours"
            label="Horas Trabalhadas (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_month_hours}
            errors={errors.min_month_hours}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="max_month_hours"
            label="Horas Trabalhadas (Max)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_month_hours}
            errors={errors.max_month_hours}
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
