import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IService, IServiceInput } from '#shared/types/backend/costs/IService';

import { serviceSchema, IServiceSchema } from '../../schema/service.schema';

type ICreateServiceModal = {
  openModal: boolean;
  closeModal: () => void;
  handleAdd(data: IService): void;
};

export function CreateServiceModal({ openModal, closeModal, handleAdd }: ICreateServiceModal) {
  const { toast } = useToast();

  const { send: createService, loading: createLoading } = usePost<IService, IServiceInput>(
    'services',
  );

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IServiceSchema>({
    resolver: yupResolver(serviceSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: IServiceSchema) => {
      const { error: createErrors, data } = await createService({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as IService);

      toast({ message: 'serviço criado', severity: 'success' });

      closeModal();
    },
    [createService, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Serviço"
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

          <CustomButton type="submit">Cadastrar Serviço</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
