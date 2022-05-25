import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { ITask, ITaskInput } from '#shared/types/backend/ITask';
import { ITaskType, limitedTaskTypesLength } from '#shared/types/backend/ITaskType';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import {
  ITaskNoDependenciesSchema,
  taskNoDependenciesSchema,
} from '../../schemas/taskNoDependencies.schema';

type IUpdateTaskModal = {
  openModal: boolean;
  closeModal(): void;
  task_id: string;
};

export function UpdateTaskNoDependenciesModal({
  openModal,
  closeModal,
  task_id,
}: IUpdateTaskModal) {
  const { toast } = useToast();

  const { send: updateTask, loading: updateLoading } = usePut<ITask, ITaskInput>(
    `/tasks/${task_id}/no_depedencies`,
  );

  const {
    loading: taskLoading,
    data: taskData,
    error: taskError,
  } = useGet<ITask>({ url: `/tasks/${task_id}` });

  const {
    loading: taskTypesLoading,
    data: taskTypesData,
    error: taskTypesError,
    send: getTaskTypes,
  } = useGet<ITaskType[]>({
    url: '/task_types/limited',
    lazy: true,
  });

  useEffect(() => {
    if (taskError) {
      toast({ message: taskError, severity: 'error' });

      return;
    }

    if (taskTypesError) {
      toast({ message: taskTypesError, severity: 'error' });
    }
  }, [taskTypesError, toast, closeModal, taskError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ITaskNoDependenciesSchema>({
    resolver: yupResolver(taskNoDependenciesSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const taskTypesOptions = useMemo(() => {
    const options = !taskTypesData ? [] : taskTypesData;

    if (taskData?.taskType) {
      const filter = options.find((task_type) => task_type.id === taskData.taskType!.id);

      if (!filter) {
        options.push(taskData.taskType as any);
      }
    }

    return options;
  }, [taskData, taskTypesData]);

  const onSubmit = useCallback(
    async ({ taskType, ...rest }: ITaskNoDependenciesSchema) => {
      const { error: updateErrors } = await updateTask({
        ...removeEmptyFields(rest),
        task_type_id: taskType.id,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      toast({ message: 'tarefa atualizada', severity: 'success' });

      closeModal();
    },
    [updateTask, toast, closeModal],
  );

  if (taskLoading) return <Loading loading={taskLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {taskData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Atualizar Tarefa"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormTextField
                  required
                  name="name"
                  label="Nome"
                  control={control}
                  errors={errors.name}
                  defaultValue={taskData.name}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  required
                  control={control}
                  name="taskType"
                  label="Tipo de Tarefa"
                  options={taskTypesOptions}
                  optionLabel="name"
                  optionValue="id"
                  defaultValue={taskData.taskType}
                  margin_type="no-margin"
                  errors={errors.taskType as any}
                  loading={taskTypesLoading}
                  handleOpen={() => getTaskTypes()}
                  handleFilter={(params) => getTaskTypes(params)}
                  limitFilter={limitedTaskTypesLength}
                  filterField="name"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="deadline"
                  label="Prazo"
                  errors={errors.deadline}
                  defaultValue={taskData.deadline}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="availableDate"
                  label="Data de Disponibilidade"
                  errors={errors.availableDate}
                  defaultValue={taskData.availableDate}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="startDate"
                  label="Data de Inicio"
                  errors={errors.startDate}
                  defaultValue={taskData.startDate}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="endDate"
                  label="Data de Término"
                  errors={errors.endDate}
                  defaultValue={taskData.endDate}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextField
                  name="link"
                  label="Link"
                  defaultValue={taskData.link}
                  control={control}
                  errors={errors.link}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextField
                  multiline
                  name="description"
                  label="Descrição"
                  defaultValue={taskData.description}
                  control={control}
                  errors={errors.description}
                  margin_type="no-margin"
                />
              </Grid>
            </Grid>

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
