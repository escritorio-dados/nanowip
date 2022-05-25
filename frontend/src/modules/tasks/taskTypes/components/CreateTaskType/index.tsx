import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { ITaskType, ITaskTypeInput } from '#shared/types/backend/ITaskType';

import { ITaskTypeSchema, taskTypeSchema } from '#modules/tasks/taskTypes/schema/taskType.schema';

type ICreateTaskTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  handleAdd(data: ITaskType): void;
};

export function CreateTaskTypeModal({ openModal, closeModal, handleAdd }: ICreateTaskTypeModal) {
  const { toast } = useToast();

  const { send: createTaskType, loading: createLoading } = usePost<ITaskType, ITaskTypeInput>(
    'task_types',
  );

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ITaskTypeSchema>({
    resolver: yupResolver(taskTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: ITaskTypeSchema) => {
      const { error: createErrors, data } = await createTaskType({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as ITaskType);

      toast({ message: 'tipo de tarefa criada', severity: 'success' });

      closeModal();
    },
    [createTaskType, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Tipo de Tarefa"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <CustomButton type="submit">Cadastrar tipo de tarefa</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
