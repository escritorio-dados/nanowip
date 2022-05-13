import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { ITaskType, ITaskTypeInput } from '#shared/types/backend/ITaskType';

import { ITaskTypeSchema, taskTypeSchema } from '#modules/taskTypes/schema/taskType.schema';

type IUpdateTaskTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  task_type_id: string;
  handleUpdateData: (id: string, newData: ITaskType) => void;
};

export function UpdateTaskTypeModal({
  closeModal,
  openModal,
  task_type_id,
  handleUpdateData,
}: IUpdateTaskTypeModal) {
  const { toast } = useToast();

  const {
    loading: taskTypeLoading,
    data: taskTypeData,
    error: taskTypeError,
  } = useGet<ITaskType>({ url: `/task_types/${task_type_id}` });

  const { send: updateTaskType, loading: updateLoading } = usePut<ITaskType, ITaskTypeInput>(
    `/task_types/${task_type_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ITaskTypeSchema>({
    resolver: yupResolver(taskTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (taskTypeError) {
      toast({ message: taskTypeError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, taskTypeError, toast]);

  const onSubmit = useCallback(
    async ({ name }: ITaskTypeSchema) => {
      const { error: updateErrors, data } = await updateTaskType({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      handleUpdateData(task_type_id, data as ITaskType);

      toast({ message: 'tipo de tarefa atualizado', severity: 'success' });

      closeModal();
    },
    [updateTaskType, handleUpdateData, task_type_id, toast, closeModal],
  );

  if (taskTypeLoading) return <Loading loading={taskTypeLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {taskTypeData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar tipo de tarefa - ${taskTypeData.name}`}
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={taskTypeData.name}
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
