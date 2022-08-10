import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { IAddModal } from '#shared/types/IModal';

import { trailSectionSchema, ITrailSectionSchema } from '../../schemas/trailSection.schema';
import { ITrailSection, ICreateTrailSectionInput } from '../../types/ITrailSection';

type ICreateTrailSectionModal = IAddModal<ITrailSection> & {
  section_trail_id: string;
};

export function CreateTrailSectionModal({
  openModal,
  closeModal,
  addList,
  section_trail_id,
}: ICreateTrailSectionModal) {
  const { toast } = useToast();

  const { send: trailSection, loading: createLoading } = usePost<
    ITrailSection,
    ICreateTrailSectionInput
  >('/trail_sections');

  const {
    loading: tagsLoading,
    data: tagsData,
    error: tagsError,
    send: getTags,
  } = useGet<string[]>({
    url: '/tags',
    lazy: true,
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ITrailSectionSchema>({
    resolver: yupResolver(trailSectionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (tagsError) {
      toast({ message: tagsError, severity: 'error' });
    }
  }, [toast, closeModal, tagsError]);

  const onSubmit = useCallback(
    async ({ name, tags }: ITrailSectionSchema) => {
      const { error: createErrors, data } = await trailSection({
        name,
        section_trail_id,
        tags,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data);

      toast({ message: 'seção criada', severity: 'success' });

      closeModal();
    },
    [trailSection, section_trail_id, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Cadastrar Seção" maxWidth="xs">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="name"
            label="Nome"
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
            defaultValue={[]}
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

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
