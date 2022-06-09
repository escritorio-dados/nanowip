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

import { customerSchema, ICustomerSchema } from '#modules/customers/schema/customer.schema';
import { ICustomer, ICustomerInput } from '#modules/customers/types/ICustomer';

type IUpdateCustomerModal = IUpdateModal<ICustomer> & { customer_id: string };

export function UpdateCustomerModal({
  closeModal,
  customer_id,
  openModal,
  updateList,
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
    async (input: ICustomerSchema) => {
      const { error: updateErrors, data } = await updateCustomer(input);

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(customer_id, data);

      toast({ message: 'cliente atualizado', severity: 'success' });

      closeModal();
    },
    [updateCustomer, updateList, customer_id, toast, closeModal],
  );

  if (customerLoading) return <Loading loading={customerLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {customerData && (
        <CustomDialog open={openModal} closeModal={closeModal} title="Editar cliente" maxWidth="xs">
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
