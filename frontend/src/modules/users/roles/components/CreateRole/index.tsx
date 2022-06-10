import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { IAddModal } from '#shared/types/IModal';
import { translatePermissions } from '#shared/utils/translatePermissions';

import { IRoleSchema, roleSchema } from '#modules/users/roles/schema/role.schema';
import { IRole, IRoleInput } from '#modules/users/roles/types/IRole';

export function CreateRoleModal({ openModal, closeModal, addList }: IAddModal<IRole>) {
  const { toast } = useToast();

  const { send: createRole, loading: createLoading } = usePost<IRole, IRoleInput>('roles');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IRoleSchema>({
    resolver: yupResolver(roleSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ permissions, name }: IRoleSchema) => {
      const fixedPermissions = permissions.map((permission) => permission.permission);

      const { error: createErrors, data: newRole } = await createRole({
        name,
        permissions: fixedPermissions,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(newRole);

      toast({ message: 'papel criado', severity: 'success' });

      closeModal();
    },
    [closeModal, createRole, addList, toast],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Cadastrar papeis" maxWidth="md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <FormSelect
            control={control}
            name="permissions"
            label="Permissões"
            multiple
            options={translatePermissions(Object.values(PermissionsUser))}
            optionLabel="translate"
            defaultValue={[]}
            errors={errors.permissions as any}
          />

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
