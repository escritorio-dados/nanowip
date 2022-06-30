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

import { ISectionTrailSchema, sectionTrailSchema } from '../../schema/sectionTrail.schema';
import { ISectionTrail, ISectionTrailInput } from '../../types/ISectionTrail';

type IUpdateSectionTrailModal = IUpdateModal<ISectionTrail> & { sectionTrail_id: string };

export function UpdateSectionTrailModal({
  closeModal,
  sectionTrail_id,
  openModal,
  updateList,
}: IUpdateSectionTrailModal) {
  const { toast } = useToast();

  const {
    loading: sectionTrailLoading,
    data: sectionTrailData,
    error: sectionTrailError,
  } = useGet<ISectionTrail>({ url: `/section_trails/${sectionTrail_id}` });

  const { send: updateSectionTrail, loading: updateLoading } = usePut<
    ISectionTrail,
    ISectionTrailInput
  >(`/section_trails/${sectionTrail_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ISectionTrailSchema>({
    resolver: yupResolver(sectionTrailSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (sectionTrailError) {
      toast({ message: sectionTrailError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, sectionTrailError, toast]);

  const onSubmit = useCallback(
    async ({ name }: ISectionTrailSchema) => {
      const { error: updateErrors, data } = await updateSectionTrail({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(sectionTrail_id, data as ISectionTrail);

      toast({ message: 'trilha atualizada', severity: 'success' });

      closeModal();
    },
    [updateSectionTrail, updateList, sectionTrail_id, toast, closeModal],
  );

  if (sectionTrailLoading) return <Loading loading={sectionTrailLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {sectionTrailData && (
        <CustomDialog open={openModal} closeModal={closeModal} title="Editar trilha" maxWidth="xs">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={sectionTrailData.name}
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
