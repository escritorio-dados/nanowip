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

import { trailSchema, ITrailSchema } from '#modules/trails/trails/schema/trail.schema';
import { ITrail, ITrailInput } from '#modules/trails/trails/types/ITrail';

export function CreateTrailModal({ openModal, closeModal, addList }: IAddModal<ITrail>) {
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
    async (input: ITrailSchema) => {
      const { error: createErrors, data } = await createTrail(input);

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data as ITrail);

      toast({ message: 'trilha criada', severity: 'success' });

      closeModal();
    },
    [createTrail, addList, toast, closeModal],
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

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
