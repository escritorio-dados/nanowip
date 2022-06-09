import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';

import { IRole, limitedRolesLength } from '#modules/users/roles/types/IRole';

type ISubmit = { role: IRole };

type IChooseRoleModal = IBaseModal & { updatePermissions(permissons: string[]): void };

export function ChooseRoleModal({ closeModal, openModal, updatePermissions }: IChooseRoleModal) {
  const { toast } = useToast();

  const {
    loading: rolesLoading,
    data: rolesData,
    error: rolesError,
    send: getRoles,
  } = useGet<IRole[]>({
    url: '/roles/limited',
    lazy: true,
  });

  const { handleSubmit, control } = useForm<ISubmit>();

  useEffect(() => {
    if (rolesError) {
      toast({ message: rolesError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, rolesError, toast]);

  const onSubmit = useCallback(
    async (formData: ISubmit) => {
      updatePermissions(formData.role.permissions);

      closeModal();
    },
    [closeModal, updatePermissions],
  );

  return (
    <>
      <CustomDialog maxWidth="xs" open={openModal} closeModal={closeModal} title="Selecionar Papel">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSelectAsync
            required
            control={control}
            name="role"
            label="Papel"
            options={rolesData || []}
            optionLabel="name"
            optionValue="id"
            defaultValue={null}
            loading={rolesLoading}
            handleOpen={() => getRoles()}
            handleFilter={(params) => getRoles(params)}
            limitFilter={limitedRolesLength}
            filterField="name"
            margin_type="no-margin"
          />

          <CustomButton type="submit">Selecionar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
