import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IMeasure, IMeasureInput } from '#shared/types/backend/IMeasure';

import { IMeasureSchema, measureSchema } from '#modules/measures/schema/measure.schema';

type ICreateMeasureModal = {
  openModal: boolean;
  closeModal: () => void;
  handleAdd(data: IMeasure): void;
};

export function CreateMeasureModal({ openModal, closeModal, handleAdd }: ICreateMeasureModal) {
  const { toast } = useToast();

  const { send: createMeasure, loading: createLoading } = usePost<IMeasure, IMeasureInput>(
    'measures',
  );

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IMeasureSchema>({
    resolver: yupResolver(measureSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: IMeasureSchema) => {
      const { error: createErrors, data } = await createMeasure({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as IMeasure);

      toast({ message: 'unidade de medida criado', severity: 'success' });

      closeModal();
    },
    [createMeasure, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Unidade de Medida"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <CustomButton type="submit">Cadastrar unidade de medida</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
