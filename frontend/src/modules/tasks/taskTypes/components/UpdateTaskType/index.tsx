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

import { ITaskTypeSchema, taskTypeSchema } from '#modules/tasks/taskTypes/schema/taskType.schema';
import { ITaskType, ITaskTypeInput } from '#modules/tasks/taskTypes/types/ITaskType';

type IUpdateTaskTypeModal = IUpdateModal<ITaskType> & { task_type_id: string };

export function UpdateTaskTypeModal({
  closeModal,
  openModal,
  task_type_id,
  updateList,
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

      updateList(task_type_id, data as ITaskType);

      toast({ message: 'tipo de tarefa atualizado', severity: 'success' });

      closeModal();
    },
    [updateTaskType, updateList, task_type_id, toast, closeModal],
  );

  if (taskTypeLoading) return <Loading loading={taskTypeLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {taskTypeData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar tipo de tarefa"
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
