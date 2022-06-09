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

import { trailSchema, ITrailSchema } from '#modules/trails/trails/schema/trail.schema';
import { ITrail, ITrailInput } from '#modules/trails/trails/types/ITrail';

type IUpdateTrailModal = IUpdateModal<ITrail> & { trail_id: string };

export function UpdateTrailModal({
  closeModal,
  trail_id,
  openModal,
  updateList,
}: IUpdateTrailModal) {
  const { toast } = useToast();

  const {
    loading: trailLoading,
    data: trailData,
    error: trailError,
  } = useGet<ITrail>({ url: `/trails/${trail_id}` });

  const { send: updateTrail, loading: updateLoading } = usePut<ITrail, ITrailInput>(
    `/trails/${trail_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ITrailSchema>({
    resolver: yupResolver(trailSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (trailError) {
      toast({ message: trailError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, trailError, toast]);

  const onSubmit = useCallback(
    async ({ name }: ITrailSchema) => {
      const { error: updateErrors, data } = await updateTrail({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(trail_id, data as ITrail);

      toast({ message: 'trilha atualizada', severity: 'success' });

      closeModal();
    },
    [updateTrail, updateList, trail_id, toast, closeModal],
  );

  if (trailLoading) return <Loading loading={trailLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {trailData && (
        <CustomDialog open={openModal} closeModal={closeModal} title="Editar trilha" maxWidth="xs">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={trailData.name}
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
