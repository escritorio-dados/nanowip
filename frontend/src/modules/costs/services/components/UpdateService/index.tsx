import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IService, IServiceInput } from '#shared/types/backend/costs/IService';

import { serviceSchema, IServiceSchema } from '../../schema/service.schema';

type IUpdateServiceModal = {
  openModal: boolean;
  closeModal: () => void;
  service_id: string;
  handleUpdateData: (id: string, newData: IService) => void;
};

export function UpdateServiceModal({
  closeModal,
  service_id,
  openModal,
  handleUpdateData,
}: IUpdateServiceModal) {
  const { toast } = useToast();

  const {
    loading: serviceLoading,
    data: serviceData,
    error: serviceError,
  } = useGet<IService>({ url: `/services/${service_id}` });

  const { send: updateService, loading: updateLoading } = usePut<IService, IServiceInput>(
    `/services/${service_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IServiceSchema>({
    resolver: yupResolver(serviceSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (serviceError) {
      toast({ message: serviceError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, serviceError, toast]);

  const onSubmit = useCallback(
    async ({ name }: IServiceSchema) => {
      const { error: updateErrors, data } = await updateService({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      handleUpdateData(service_id, data as IService);

      toast({ message: 'serviço atualizado', severity: 'success' });

      closeModal();
    },
    [updateService, handleUpdateData, service_id, toast, closeModal],
  );

  if (serviceLoading) return <Loading loading={serviceLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {serviceData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar serviço - ${serviceData.name}`}
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={serviceData.name}
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
