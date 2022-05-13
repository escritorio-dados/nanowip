import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { ICustomer, ICustomerInput } from '#shared/types/backend/ICustomer';

import { customerSchema, ICustomerSchema } from '#modules/customers/schema/customer.schema';

type IUpdateCustomerModal = {
  openModal: boolean;
  closeModal: () => void;
  customer_id: string;
  handleUpdateData: (id: string, newData: ICustomer) => void;
};

export function UpdateCustomerModal({
  closeModal,
  customer_id,
  openModal,
  handleUpdateData,
}: IUpdateCustomerModal) {
  const { toast } = useToast();

  const {
    loading: customerLoading,
    data: customerData,
    error: customerError,
  } = useGet<ICustomer>({ url: `/customers/${customer_id}` });

  const { send: updateCustomer, loading: updateLoading } = usePut<ICustomer, ICustomerInput>(
    `/customers/${customer_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ICustomerSchema>({
    resolver: yupResolver(customerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (customerError) {
      toast({ message: customerError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, customerError, toast]);

  const onSubmit = useCallback(
    async ({ name }: ICustomerSchema) => {
      const { error: updateErrors, data } = await updateCustomer({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      handleUpdateData(customer_id, data as ICustomer);

      toast({ message: 'cliente atualizado', severity: 'success' });

      closeModal();
    },
    [updateCustomer, handleUpdateData, customer_id, toast, closeModal],
  );

  if (customerLoading) return <Loading loading={customerLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {customerData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar cliente - ${customerData.name}`}
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={customerData.name}
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
