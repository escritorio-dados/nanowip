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

import { ITrailSectionSchema, trailSectionSchema } from '../../schemas/trailSection.schema';
import { ITrailSection, IUpdateTrailSectionInput } from '../../types/ITrailSection';

type IUpdateTrailSectionModal = IUpdateModal<ITrailSection> & { trail_section_id: string };

export function UpdateTrailSectionModal({
  closeModal,
  trail_section_id,
  openModal,
  updateList,
}: IUpdateTrailSectionModal) {
  const { toast } = useToast();

  const {
    loading: trailSectionLoading,
    data: trailSectionData,
    error: trailSectionError,
  } = useGet<ITrailSection>({ url: `/trail_sections/${trail_section_id}` });

  const { send: trailSection, loading: updateLoading } = usePut<
    ITrailSection,
    IUpdateTrailSectionInput
  >(`/trail_sections/${trail_section_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ITrailSectionSchema>({
    resolver: yupResolver(trailSectionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (trailSectionError) {
      toast({ message: trailSectionError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, trailSectionError, toast]);

  const onSubmit = useCallback(
    async ({ name }: ITrailSectionSchema) => {
      const { error: updateErrors, data } = await trailSection({
        name,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(trail_section_id, data as ITrailSection);

      toast({ message: 'seção atualizada', severity: 'success' });

      closeModal();
    },
    [trailSection, updateList, trail_section_id, toast, closeModal],
  );

  if (trailSectionLoading) return <Loading loading={trailSectionLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {trailSectionData && (
        <CustomDialog open={openModal} closeModal={closeModal} title="Editar seção" maxWidth="sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              required
              name="name"
              label="Nome"
              defaultValue={trailSectionData.name}
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
