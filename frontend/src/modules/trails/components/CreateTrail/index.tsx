import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { ITrail, ITrailInput } from '#shared/types/backend/ITrail';

import { trailSchema, ITrailSchema } from '#modules/trails/schema/trail.schema';

type ICreateTrailModal = {
  openModal: boolean;
  closeModal: () => void;
  handleAdd(data: ITrail): void;
};

export function CreateTrailModal({ openModal, closeModal, handleAdd }: ICreateTrailModal) {
  const { toast } = useToast();

  const { send: createTrail, loading: createLoading } = usePost<ITrail, ITrailInput>('trails');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ITrailSchema>({
    resolver: yupResolver(trailSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: ITrailSchema) => {
      const { error: createErrors, data } = await createTrail({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as ITrail);

      toast({ message: 'trilha criada', severity: 'success' });

      closeModal();
    },
    [createTrail, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Cadastrar Trila" maxWidth="xs">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <CustomButton type="submit">Cadastrar Trilha</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
