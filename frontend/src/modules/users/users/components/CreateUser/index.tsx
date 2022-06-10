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
import { usePost } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { IAddModal } from '#shared/types/IModal';
import { translatePermissions } from '#shared/utils/translatePermissions';

import { ChooseRoleModal } from '#modules/users/roles/components/Choose';
import {
  createUserSchema,
  ICreateUserSchema,
} from '#modules/users/users/schema/create.user.schema';
import { ICreateUser, IUser } from '#modules/users/users/types/IUser';

import { ChoosePermissionArea } from './styles';

export function CreateUserModal({ closeModal, openModal, addList }: IAddModal<IUser>) {
  const [chooseRole, setChooseRole] = useState(false);
  const [permissionsRole, setPermissionsRole] = useState<string[]>([]);

  const { toast } = useToast();
  const { checkPermissions } = useAuth();

  const { send: createUser, loading: createLoading } = usePost<IUser, ICreateUser>('users');

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<ICreateUserSchema>({
    resolver: yupResolver(createUserSchema),
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

  const onSubmit = useCallback(
    async ({ permissions, ...rest }: ICreateUserSchema) => {
      const fixedPermissions = permissions.map((permission) => permission.permission);

      const { error: createError, data: newUser } = await createUser({
        permissions: fixedPermissions,
        ...rest,
      });

      if (createError) {
        toast({ message: createError, severity: 'error' });
        return;
      }

      toast({ message: 'usuario criado', severity: 'success' });

      addList(newUser as IUser);

      closeModal();
    },
    [closeModal, createUser, addList, toast],
  );

  return (
    <>
      <Loading loading={createLoading} />

      {chooseRole && (
        <ChooseRoleModal
          openModal={chooseRole}
          closeModal={() => setChooseRole(false)}
          updatePermissions={(permissions) => setPermissionsRole(permissions)}
        />
      )}

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar usuario"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <FormTextField name="email" label="E-mail" control={control} errors={errors.email} />

          <FormTextField
            name="password"
            label="Senha"
            type="password"
            autoComplete="off"
            control={control}
            errors={errors.password}
          />

          <FormTextField
            name="confirmPassword"
            label="Confirmar Senha"
            type="password"
            autoComplete="off"
            control={control}
            errors={errors.confirmPassword}
          />

          {rolePermissions && (
            <ChoosePermissionArea>
              <CustomIconButton
                action={() => setChooseRole(true)}
                title="Carregar Papel"
                iconType="custom"
                CustomIcon={<Description sx={{ color: 'success.main' }} />}
              />
            </ChoosePermissionArea>
          )}

          <FormSelect
            control={control}
            name="permissions"
            label="Permissões"
            multiple
            options={translatePermissions(Object.values(PermissionsUser))}
            optionLabel="translate"
            optionValue="permission"
            defaultValue={[]}
            errors={errors.permissions as any}
          />

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
