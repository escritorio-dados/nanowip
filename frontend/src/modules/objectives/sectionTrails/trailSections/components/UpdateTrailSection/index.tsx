import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
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

  const {
    loading: tagsLoading,
    data: tagsData,
    error: tagsError,
    send: getTags,
  } = useGet<string[]>({
    url: '/tags',
    lazy: true,
  });

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

      return;
    }

    if (tagsError) {
      toast({ message: tagsError, severity: 'error' });
    }
  }, [closeModal, trailSectionError, toast, tagsError]);

  const onSubmit = useCallback(
    async ({ name, tags }: ITrailSectionSchema) => {
      const { error: updateErrors, data } = await trailSection({
        name,
        tags,
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

  const defaultTags = useMemo(() => {
    if (!trailSectionData || !trailSectionData.tagsGroup) {
      return [];
    }

    return trailSectionData.tagsGroup.tags.map((tag) => tag.name);
  }, [trailSectionData]);

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

            <FormSelectAsync
              multiple
              freeSolo
              control={control}
              name="tags"
              label="Tags"
              options={tagsData || []}
              defaultValue={defaultTags}
              errors={errors.tags}
              loading={tagsLoading}
              handleOpen={() => getTags()}
              handleFilter={(params) =>
                getTags({
                  params: { ...params?.params },
                })
              }
              limitFilter={100}
              filterField="name"
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
