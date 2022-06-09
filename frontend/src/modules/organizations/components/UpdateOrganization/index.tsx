import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IUpdateModal } from '#shared/types/IModal';

import {
  organizationSchema,
  IOrganizationSchema,
} from '#modules/organizations/schema/organization.schema';
import { IOrganization, IOrganizationInput } from '#modules/organizations/types/IOrganization';

type IUpdateOrganizationModal = IUpdateModal<IOrganization> & { organization_id: string };

export function UpdateOrganizationModal({
  closeModal,
  organization_id,
  openModal,
  updateList,
}: IUpdateOrganizationModal) {
  const { toast } = useToast();

  const {
    loading: organizationLoading,
    data: organizationData,
    error: organizationError,
  } = useGet<IOrganization>({ url: `/organizations/${organization_id}` });

  const { send: updateOrganization, loading: updateLoading } = usePut<
    IOrganization,
    IOrganizationInput
  >(`/organizations/${organization_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IOrganizationSchema>({
    resolver: yupResolver(organizationSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (organizationError) {
      toast({ message: organizationError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, organizationError, toast]);

  const onSubmit = useCallback(
    async ({ name }: IOrganizationSchema) => {
      const { error: updateErrors, data } = await updateOrganization({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(organization_id, data as IOrganization);

      toast({ message: 'organização atualizada', severity: 'success' });

      closeModal();
    },
    [updateOrganization, updateList, organization_id, toast, closeModal],
  );

  if (organizationLoading) return <Loading loading={organizationLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {organizationData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar organização"
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={organizationData.name}
              control={control}
              errors={errors.name}
              margin_type="no-margin"
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
