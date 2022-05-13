import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { ICustomer, ICustomerInput } from '#shared/types/backend/ICustomer';

import { customerSchema, ICustomerSchema } from '#modules/customers/schema/customer.schema';

type ICreateCustomerModal = {
  openModal: boolean;
  closeModal: () => void;
  handleAdd(data: ICustomer): void;
};

export function CreateCustomerModal({ openModal, closeModal, handleAdd }: ICreateCustomerModal) {
  const { toast } = useToast();

  const { send: createCustomer, loading: createLoading } = usePost<ICustomer, ICustomerInput>(
    'customers',
  );

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ICustomerSchema>({
    resolver: yupResolver(customerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: ICustomerSchema) => {
      const { error: createErrors, data } = await createCustomer({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as ICustomer);

      toast({ message: 'cliente criado', severity: 'success' });

      closeModal();
    },
    [createCustomer, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Cliente"
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

          <CustomButton type="submit">Cadastrar Cliente</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
