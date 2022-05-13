import { yupResolver } from '@hookform/resolvers/yup';
import { Description } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IUpdateUser, IUser } from '#shared/types/backend/IUser';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';
import { translatePermissions } from '#shared/utils/translatePermissions';

import { ChooseRoleModal } from '#modules/roles/components/Choose';
import { IUpdateUserSchema, updateUserSchema } from '#modules/users/schema/update.user.schema';

import { ChoosePermissionArea } from './styles';

type IUpdateUserModal = {
  openModal: boolean;
  closeModal: () => void;
  user_id: string;
  handleUpdateData: (id: string, newData: IUser) => void;
};

export function UpdateUserModal({
  closeModal,
  user_id,
  openModal,
  handleUpdateData,
}: IUpdateUserModal) {
  const [chooseRole, setChooseRole] = useState(false);
  const [permissionsRole, setPermissionsRole] = useState<string[]>([]);

  const { toast } = useToast();
  const { user, checkPermissions } = useAuth();

  const {
    loading: userLoading,
    data: userData,
    error: userError,
  } = useGet<IUser>({ url: `/users/${user_id}` });

  const { send: updateUser, loading: updateLoading } = usePut<IUser, IUpdateUser>(
    `/users/${user_id}`,
  );

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<IUpdateUserSchema>({
    resolver: yupResolver(updateUserSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const rolePermissions = useMemo(() => {
    return checkPermissions([[PermissionsUser.read_role, PermissionsUser.manage_role]]);
  }, [checkPermissions]);

  useEffect(() => {
    if (permissionsRole.length > 0) {
      setValue('permissions', translatePermissions(permissionsRole));

      setPermissionsRole([]);
    }
  }, [permissionsRole, setValue]);

  useEffect(() => {
    if (userError) {
      toast({ message: userError, severity: 'error' });

      closeModal();
    }
  }, [userError, toast, closeModal]);

  const onSubmit = useCallback(
    async (formData: IUpdateUserSchema) => {
      const fixedData = removeEmptyFields(formData);

      const { permissions, ...rest } = fixedData;

      const fixedPermissions = permissions.map((permission) => permission.permission);

      const { error: updateErrors, data } = await updateUser({
        ...rest,
        permissions: fixedPermissions,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      handleUpdateData(user_id, data as IUser);

      toast({ message: 'usuario atualizado', severity: 'success' });

      closeModal();
    },
    [updateUser, handleUpdateData, user_id, toast, closeModal],
  );

  if (userLoading) return <Loading loading={userLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {chooseRole && (
        <ChooseRoleModal
          openModal={chooseRole}
          closeModal={() => setChooseRole(false)}
          updatePermissions={(permissions) => setPermissionsRole(permissions)}
        />
      )}

      {userData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar usuario - ${userData.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={userData.name}
              control={control}
              errors={errors.name}
              margin_type="no-margin"
            />

            <FormTextField
              name="email"
              label="E-mail"
              control={control}
              errors={errors.email}
              defaultValue={userData.email}
            />

            <FormTextField
              name="password"
              label="Senha Nova"
              type="password"
              placeholder="Mantenha em branco para não alterar"
              autoComplete="current-password"
              control={control}
              errors={errors.password}
            />

            <FormTextField
              name="confirmPassword"
              label="Confirmar Senha"
              type="password"
              placeholder="Mantenha em branco para não alterar"
              autoComplete="current-password"
              control={control}
              errors={errors.confirmPassword}
            />

            {rolePermissions && (
              <ChoosePermissionArea>
                <CustomIconButton
                  action={() => setChooseRole(true)}
                  title="Carregar Papel"
                  type="custom"
                  CustomIcon={<Description style={{ color: 'success.main' }} />}
                />
              </ChoosePermissionArea>
            )}

            <FormSelect
              control={control}
              disabled={userData.id === user.id}
              name="permissions"
              label="Permissões"
              multiple
              options={translatePermissions(Object.values(PermissionsUser))}
              optionLabel="translate"
              optionValue="permission"
              defaultValue={translatePermissions(userData.permissions)}
              errors={errors.permissions as any}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
