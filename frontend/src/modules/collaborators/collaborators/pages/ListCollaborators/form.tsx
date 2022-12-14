import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';

import { ICollaboratorFilters } from '#modules/collaborators/collaborators/types/ICollaborator';

export const defaultCollaboratorFilter: ICollaboratorFilters = {
  name: '',
  jobTitle: '',
  type: null,
  min_updated: null,
  max_updated: null,
};

export function ListCollaboratorsFilter({
  apiConfig,
  ...props
}: IListFilter<ICollaboratorFilters>) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<ICollaboratorFilters>();

  return (
    <FilterListForm
      defaultFilter={defaultCollaboratorFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
      <Grid container spacing={2}>
        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="name"
            label="Nome"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.name}
            errors={errors.name}
          />
        </Grid>
        <Grid item sm={6} xs={12}>
          <FormTextField
            control={control}
            name="jobTitle"
            label="Cargo"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.jobTitle}
            errors={errors.jobTitle}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormSelect
            control={control}
            name="type"
            label="Tipo"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.type}
            options={['Interno', 'Externo']}
            errors={errors.type}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="min_updated"
            label="Data de Atualiza????o (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_updated}
            errors={errors.min_updated}
          />
        </Grid>

        <Grid item sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="max_updated"
            label="Data de Atualiza????o (Max)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.max_updated}
            errors={errors.max_updated}
          />
        </Grid>
      </Grid>
    </FilterListForm>
  );
}
