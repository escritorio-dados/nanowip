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

import {
  IObjectiveSectionSchema,
  objectiveSectionSchema,
} from '../../schemas/objectiveSection.schema';
import { IObjectiveSection, IUpdateObjectiveSectionInput } from '../../types/IObjectiveSection';

type IUpdateObjectiveSectionModal = IUpdateModal<IObjectiveSection> & {
  objective_section_id: string;
};

export function UpdateObjectiveSectionModal({
  closeModal,
  objective_section_id,
  openModal,
  updateList,
}: IUpdateObjectiveSectionModal) {
  const { toast } = useToast();

  const {
    loading: objectiveSectionLoading,
    data: objectiveSectionData,
    error: objectiveSectionError,
  } = useGet<IObjectiveSection>({ url: `/objective_sections/${objective_section_id}` });

  const { send: objectiveSection, loading: updateLoading } = usePut<
    IObjectiveSection,
    IUpdateObjectiveSectionInput
  >(`/objective_sections/${objective_section_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IObjectiveSectionSchema>({
    resolver: yupResolver(objectiveSectionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (objectiveSectionError) {
      toast({ message: objectiveSectionError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, objectiveSectionError, toast]);

  const onSubmit = useCallback(
    async ({ name }: IObjectiveSectionSchema) => {
      const { error: updateErrors, data } = await objectiveSection({
        name,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(objective_section_id, data);

      toast({ message: 'seção atualizada', severity: 'success' });

      closeModal();
    },
    [objectiveSection, updateList, objective_section_id, toast, closeModal],
  );

  if (objectiveSectionLoading) return <Loading loading={objectiveSectionLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {objectiveSectionData && (
        <CustomDialog open={openModal} closeModal={closeModal} title="Editar seção" maxWidth="sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              required
              name="name"
              label="Nome"
              defaultValue={objectiveSectionData.name}
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
