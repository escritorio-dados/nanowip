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

import {
  objectiveSectionSchema,
  IObjectiveSectionSchema,
} from '../../schemas/objectiveSection.schema';
import { IObjectiveSection, ICreateObjectiveSectionInput } from '../../types/IObjectiveSection';

type ICreateObjectiveSectionModal = IAddModal<IObjectiveSection> & {
  objective_category_id: string;
};

export function CreateObjectiveSectionModal({
  openModal,
  closeModal,
  addList,
  objective_category_id,
}: ICreateObjectiveSectionModal) {
  const { toast } = useToast();

  const { send: createObjectiveSection, loading: createLoading } = usePost<
    IObjectiveSection,
    ICreateObjectiveSectionInput
  >('/objective_sections');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IObjectiveSectionSchema>({
    resolver: yupResolver(objectiveSectionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: IObjectiveSectionSchema) => {
      const { error: createErrors, data } = await createObjectiveSection({
        name,
        objective_category_id,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data);

      toast({ message: 'seção criada', severity: 'success' });

      closeModal();
    },
    [createObjectiveSection, objective_category_id, addList, toast, closeModal],
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
