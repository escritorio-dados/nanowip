import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IMeasure, IMeasureInput } from '#shared/types/backend/IMeasure';

import { IMeasureSchema, measureSchema } from '#modules/measures/schema/measure.schema';

type IUpdateMeasureModal = {
  openModal: boolean;
  closeModal: () => void;
  measure_id: string;
  handleUpdateData: (id: string, newData: IMeasure) => void;
};

export function UpdateMeasureModal({
  closeModal,
  openModal,
  measure_id,
  handleUpdateData,
}: IUpdateMeasureModal) {
  const { toast } = useToast();

  const {
    loading: measureLoading,
    data: measureData,
    error: measureError,
  } = useGet<IMeasure>({ url: `/measures/${measure_id}` });

  const { send: updateMeasure, loading: updateLoading } = usePut<IMeasure, IMeasureInput>(
    `/measures/${measure_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IMeasureSchema>({
    resolver: yupResolver(measureSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (measureError) {
      toast({ message: measureError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, measureError, toast]);

  const onSubmit = useCallback(
    async ({ name }: IMeasureSchema) => {
      const { error: updateErrors, data } = await updateMeasure({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      handleUpdateData(measure_id, data as IMeasure);

      toast({ message: 'unidade de medida atualizada', severity: 'success' });

      closeModal();
    },
    [updateMeasure, handleUpdateData, measure_id, toast, closeModal],
  );

  if (measureLoading) return <Loading loading={measureLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {measureData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar unidade de medida - ${measureData.name}`}
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={measureData.name}
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
