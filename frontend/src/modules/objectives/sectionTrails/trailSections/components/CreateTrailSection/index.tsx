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
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ITrailSectionSchema>({
    resolver: yupResolver(trailSectionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: ITrailSectionSchema) => {
      const { error: createErrors, data } = await trailSection({
        name,
        section_trail_id,
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

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
