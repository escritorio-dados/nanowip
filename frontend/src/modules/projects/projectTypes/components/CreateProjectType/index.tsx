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
  IProjectTypeSchema,
  projectTypeSchema,
} from '#modules/projects/projectTypes/schema/projectType.schema';

import { IProjectType, IProjectTypeInput } from '../../types/IProjectType';

export function CreateProjectTypeModal({
  openModal,
  closeModal,
  addList,
}: IAddModal<IProjectType>) {
  const { toast } = useToast();

  const { send: createProjectType, loading: createLoading } = usePost<
    IProjectType,
    IProjectTypeInput
  >('project_types');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IProjectTypeSchema>({
    resolver: yupResolver(projectTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: IProjectTypeSchema) => {
      const { error: createErrors, data } = await createProjectType({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data as IProjectType);

      toast({ message: 'tipo de projeto criado', severity: 'success' });

      closeModal();
    },
    [createProjectType, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Tipo de Projeto"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
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
