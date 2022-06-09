import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';

import { FilterListForm, IListFilter } from '#shared/components/FilterListForm';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { translatePermissions } from '#shared/utils/translatePermissions';

import { IUserFilters } from '#modules/users/users/types/IUser';

export const defaultUserFilter: IUserFilters = {
  name: '',
  email: '',
  permission: null,
  min_updated: null,
  max_updated: null,
};

export function ListUsersFilter({ apiConfig, ...props }: IListFilter<IUserFilters>) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IUserFilters>();

  return (
    <FilterListForm
      defaultFilter={defaultUserFilter}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      {...props}
    >
      <Grid container spacing={2}>
        <Grid item lg={4} sm={6} xs={12}>
          <FormTextField
            control={control}
            name="name"
            label="Nome"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.name}
            errors={errors.name}
          />
        </Grid>

        <Grid item lg={4} sm={6} xs={12}>
          <FormTextField
            control={control}
            name="email"
            label="E-mail"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.email}
            errors={errors.email}
          />
        </Grid>

        <Grid item lg={4} sm={6} xs={12}>
          <FormSelect
            control={control}
            name="permission"
            label="Permissão"
            margin_type="no-margin"
            options={translatePermissions(Object.values(PermissionsUser))}
            optionLabel="translate"
            optionValue="permission"
            defaultValue={apiConfig.filters.permission}
            errors={errors.permission as any}
          />
        </Grid>

        <Grid item lg={4} sm={6} xs={12}>
          <FormDateTimePicker
            control={control}
            name="min_updated"
            label="Data de Atualização (Min)"
            margin_type="no-margin"
            defaultValue={apiConfig.filters.min_updated}
            errors={errors.min_updated}
          />
        </Grid>

        <Grid item lg={4} sm={6} xs={12}>
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
