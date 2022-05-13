import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IProjectType, IProjectTypeInput } from '#shared/types/backend/IProjectType';

import {
  IProjectTypeSchema,
  projectTypeSchema,
} from '#modules/projectTypes/schema/projectType.schema';

type IUpdateProjectTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  projectType_id: string;
  handleUpdateData: (id: string, newData: IProjectType) => void;
};

export function UpdateProjectTypeModal({
  closeModal,
  openModal,
  projectType_id,
  handleUpdateData,
}: IUpdateProjectTypeModal) {
  const { toast } = useToast();

  const {
    loading: projectTypeLoading,
    data: projectTypeData,
    error: projectTypeError,
  } = useGet<IProjectType>({ url: `/project_types/${projectType_id}` });

  const { send: updateProjectType, loading: updateLoading } = usePut<
    IProjectType,
    IProjectTypeInput
  >(`/project_types/${projectType_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IProjectTypeSchema>({
    resolver: yupResolver(projectTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (projectTypeError) {
      toast({ message: projectTypeError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, projectTypeError, toast]);

  const onSubmit = useCallback(
    async ({ name }: IProjectTypeSchema) => {
      const { error: updateErrors, data } = await updateProjectType({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      handleUpdateData(projectType_id, data as IProjectType);

      toast({ message: 'tipo de projeto atualizado', severity: 'success' });

      closeModal();
    },
    [updateProjectType, handleUpdateData, projectType_id, toast, closeModal],
  );

  if (projectTypeLoading) return <Loading loading={projectTypeLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {projectTypeData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar tipo de projeto - ${projectTypeData.name}`}
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={projectTypeData.name}
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
