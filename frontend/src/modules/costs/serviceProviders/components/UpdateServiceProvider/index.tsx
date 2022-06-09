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
  IServiceProvider,
  IServiceProviderInput,
} from '#modules/costs/serviceProviders/types/IServiceProvider';

import { serviceProviderSchema, IServiceProviderSchema } from '../../schema/serviceProvider.schema';

type IUpdateServiceProviderModal = IUpdateModal<IServiceProvider> & { service_provider_id: string };

export function UpdateServiceProviderModal({
  closeModal,
  service_provider_id,
  openModal,
  updateList,
}: IUpdateServiceProviderModal) {
  const { toast } = useToast();

  const {
    loading: serviceProviderLoading,
    data: serviceProviderData,
    error: serviceProviderError,
  } = useGet<IServiceProvider>({ url: `/service_providers/${service_provider_id}` });

  const { send: updateServiceProvider, loading: updateLoading } = usePut<
    IServiceProvider,
    IServiceProviderInput
  >(`/service_providers/${service_provider_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IServiceProviderSchema>({
    resolver: yupResolver(serviceProviderSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (serviceProviderError) {
      toast({ message: serviceProviderError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, serviceProviderError, toast]);

  const onSubmit = useCallback(
    async ({ name }: IServiceProviderSchema) => {
      const { error: updateErrors, data } = await updateServiceProvider({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(service_provider_id, data);

      toast({ message: 'prestador de serviço atualizado', severity: 'success' });

      closeModal();
    },
    [updateServiceProvider, updateList, service_provider_id, toast, closeModal],
  );

  if (serviceProviderLoading) return <Loading loading={serviceProviderLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {serviceProviderData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar prestador de serviço"
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={serviceProviderData.name}
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
