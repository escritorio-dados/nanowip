import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';

import {
  IIntegratedObjective,
  limitedIntegratedObjectivesLength,
} from '#modules/objectives/integratedObjectives/types/IIntegratedObjective';

import { IOperationalObjectiveFilters } from '../../types/IOperationalObjective';

export const defaultOperationalObjectiveFilter: IOperationalObjectiveFilters = {
  name: '',
  integratedObjective: null,
  min_deadline: null,
  max_deadline: null,
  min_updated: null,
  max_updated: null,
};

export function ListOperationalObjectivesFilter({
  apiConfig,
  ...props
}: IListFilter<IOperationalObjectiveFilters>) {
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IOperationalObjectiveFilters>();

  const {
    loading: integratedObjectivesLoading,
    data: integratedObjectivesData,
    error: integratedObjectivesError,
    send: getIntegratedObjectives,
  } = useGet<IIntegratedObjective[]>({
    url: '/integrated_objectives/limited',
    lazy: true,
  });

  useEffect(() => {
    if (integratedObjectivesError) {
      toast({ message: integratedObjectivesError, severity: 'error' });
    }
  }, [integratedObjectivesError, toast]);

  const integratedObjectivesOptions = useMemo(() => {
    const options = !integratedObjectivesData ? [] : integratedObjectivesData;

    if (apiConfig.filters.integratedObjective) {
      const filter = options.find(
        (integratedObjective) =>
          integratedObjective.id === apiConfig.filters.integratedObjective!.id,
      );

      if (!filter) {
        options.push(apiConfig.filters.integratedObjective as any);
      }
    }

    return options;
  }, [apiConfig.filters.integratedObjective, integratedObjectivesData]);

  return (
    <FilterListForm
      defaultFilter={defaultOperationalObjectiveFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormTextField
            control={control}
            name="name"
            label="Nome"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.name}
            errors={errors.name}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormSelectAsync
            control={control}
            name="integratedObjective"
            label="Objetivo Integrado"
            options={integratedObjectivesOptions}
            optionLabel="name"
            optionValue="id"
            filterField="name"
            defaultValue={apiConfig.filters.integratedObjective}
            margin_type="no-margin"
            errors={errors.integratedObjective as any}
            loading={integratedObjectivesLoading}
            handleOpen={() => getIntegratedObjectives()}
            handleFilter={(params) => getIntegratedObjectives(params)}
            limitFilter={limitedIntegratedObjectivesLength}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormDateTimePicker
            control={control}
            name="min_deadline"
            label="Data de Prazo (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_deadline}
            errors={errors.min_deadline}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormDateTimePicker
            control={control}
            name="max_deadline"
            label="Data de Prazo (Max)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_deadline}
            errors={errors.max_deadline}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormDateTimePicker
            control={control}
            name="min_updated"
            label="Data de Atualização (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_updated}
            errors={errors.min_updated}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
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
