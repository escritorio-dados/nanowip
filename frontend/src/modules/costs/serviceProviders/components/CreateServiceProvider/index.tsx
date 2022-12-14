import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IAddModal } from '#shared/types/IModal';

import {
  IServiceProvider,
  IServiceProviderInput,
} from '#modules/costs/serviceProviders/types/IServiceProvider';

import { serviceProviderSchema, IServiceProviderSchema } from '../../schema/serviceProvider.schema';

export function CreateServiceProviderModal({
  openModal,
  closeModal,
  addList,
}: IAddModal<IServiceProvider>) {
  const { toast } = useToast();

  const { send: createServiceProvider, loading: createLoading } = usePost<
    IServiceProvider,
    IServiceProviderInput
  >('service_providers');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IServiceProviderSchema>({
    resolver: yupResolver(serviceProviderSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: IServiceProviderSchema) => {
      const { error: createErrors, data } = await createServiceProvider({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data as IServiceProvider);

      toast({ message: 'prestador de serviço criado', severity: 'success' });

      closeModal();
    },
    [createServiceProvider, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Prestador de Serviço"
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

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
