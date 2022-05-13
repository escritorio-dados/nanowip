import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IOrganization, IOrganizationInput } from '#shared/types/backend/IOrganization';

import {
  organizationSchema,
  IOrganizationSchema,
} from '#modules/organizations/schema/organization.schema';

type ICreateOrganizationModal = {
  openModal: boolean;
  closeModal: () => void;
  handleAdd(data: IOrganization): void;
};

export function CreateOrganizationModal({
  openModal,
  closeModal,
  handleAdd,
}: ICreateOrganizationModal) {
  const { toast } = useToast();

  const { send: createOrganization, loading: createLoading } = usePost<
    IOrganization,
    IOrganizationInput
  >('organizations');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IOrganizationSchema>({
    resolver: yupResolver(organizationSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: IOrganizationSchema) => {
      const { error: createErrors, data } = await createOrganization({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as IOrganization);

      toast({ message: 'organização criada', severity: 'success' });

      closeModal();
    },
    [createOrganization, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Organização"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <CustomButton type="submit">Cadastrar Organização</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
