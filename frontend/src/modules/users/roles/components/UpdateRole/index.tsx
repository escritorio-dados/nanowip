import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IUpdateModal } from '#shared/types/IModal';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';
import { translatePermissions } from '#shared/utils/translatePermissions';

import { IRoleSchema, roleSchema } from '#modules/users/roles/schema/role.schema';
import { IRole, IRoleInput } from '#modules/users/roles/types/IRole';

type IUpdateRoleModal = IUpdateModal<IRole> & { role_id: string };

export function UpdateRoleModal({ closeModal, role_id, openModal, updateList }: IUpdateRoleModal) {
  const { toast } = useToast();

  const {
    loading: roleLoading,
    data: roleData,
    error: roleError,
  } = useGet<IRole>({ url: `/roles/${role_id}` });

  const { send: updateRole, loading: updateLoading } = usePut<IRole, IRoleInput>(
    `/roles/${role_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IRoleSchema>({
    resolver: yupResolver(roleSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (roleError) {
      toast({ message: roleError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, roleError, toast]);

  const onSubmit = useCallback(
    async (formData: IRoleSchema) => {
      const fixedData = removeEmptyFields(formData);

      const { permissions, name } = fixedData;

      const fixedPermissions = permissions.map((permission) => permission.permission);

      const { error: updateErrors, data } = await updateRole({
        permissions: fixedPermissions,
        name,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(role_id, data);

      toast({ message: 'papel atualizado', severity: 'success' });

      closeModal();
    },
    [updateRole, updateList, role_id, toast, closeModal],
  );

  if (roleLoading) return <Loading loading={roleLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {roleData && (
        <CustomDialog open={openModal} closeModal={closeModal} title="Editar papel" maxWidth="md">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={roleData.name}
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
              defaultValue={translatePermissions(roleData.permissions)}
              errors={errors.permissions as any}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
