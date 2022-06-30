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

import { ISectionTrailSchema, sectionTrailSchema } from '../../schema/sectionTrail.schema';
import { ISectionTrail, ISectionTrailInput } from '../../types/ISectionTrail';

export function CreateSectionTrailModal({
  openModal,
  closeModal,
  addList,
}: IAddModal<ISectionTrail>) {
  const { toast } = useToast();

  const { send: createSectionTrail, loading: createLoading } = usePost<
    ISectionTrail,
    ISectionTrailInput
  >('section_trails');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ISectionTrailSchema>({
    resolver: yupResolver(sectionTrailSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async (input: ISectionTrailSchema) => {
      const { error: createErrors, data } = await createSectionTrail(input);

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data as ISectionTrail);

      toast({ message: 'trilha criada', severity: 'success' });

      closeModal();
    },
    [createSectionTrail, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Cadastrar Trilha" maxWidth="xs">
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
