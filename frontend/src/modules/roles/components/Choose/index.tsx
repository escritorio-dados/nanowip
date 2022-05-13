import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelect } from '#shared/components/form/FormSelect';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IRole } from '#shared/types/backend/IRole';

type ISubmit = { role: IRole };

type IChooseRoleModal = {
  openModal: boolean;
  closeModal(): void;
  updatePermissions(permissons: string[]): void;
};

export function ChooseRoleModal({ closeModal, openModal, updatePermissions }: IChooseRoleModal) {
  const { toast } = useToast();

  const {
    loading: rolesLoading,
    data: rolesData,
    error: rolesError,
  } = useGet<IRole[]>({ url: 'roles/all' });

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

  if (rolesLoading) return <Loading loading={rolesLoading} />;

  return (
    <>
      {rolesData && (
        <CustomDialog
          maxWidth="xs"
          open={openModal}
          closeModal={closeModal}
          title="Selecionar Papel"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormSelect
              control={control}
              name="role"
              label="Papel"
              options={rolesData}
              optionLabel="name"
              defaultValue={null}
              margin_type="no-margin"
            />

            <CustomButton type="submit">Selecionar</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
