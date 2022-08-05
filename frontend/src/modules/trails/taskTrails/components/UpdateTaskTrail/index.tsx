import { yupResolver } from '@hookform/resolvers/yup';
import { Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';

import { ITaskType, limitedTaskTypesLength } from '#modules/tasks/taskTypes/types/ITaskType';
import {
  ITaskTrailSchema,
  taskTrailSchema,
} from '#modules/trails/taskTrails/schemas/taskTrail.schema';
import {
  ITaskTrail,
  ITaskTrailInput,
  limitedTaskTrailLength,
} from '#modules/trails/taskTrails/types/ITaskTrail';

type IUpdateTaskTrailModal = IReloadModal & { trail_id: string; task_id: string };

export function UpdateTaskTrailModal({
  openModal,
  closeModal,
  reloadList,
  trail_id,
  task_id,
}: IUpdateTaskTrailModal) {
  const { toast } = useToast();

  const { send: updateTask, loading: updateLoading } = usePut<ITaskTrail, ITaskTrailInput>(
    `/task_trails/${task_id}`,
  );

  const {
    loading: taskLoading,
    data: taskData,
    error: taskError,
  } = useGet<ITaskTrail>({ url: `/task_trails/${task_id}` });

  const {
    loading: taskTypesLoading,
    data: taskTypesData,
    error: taskTypesError,
    send: getTaskTypes,
  } = useGet<ITaskType[]>({
    url: '/task_types/limited',
    lazy: true,
  });

  const {
    loading: tagsLoading,
    data: tagsData,
    error: tagsError,
    send: getTags,
  } = useGet<string[]>({
    url: '/tags',
    lazy: true,
  });

  const {
    loading: nextTasksLoading,
    data: nextTasksData,
    error: nextTasksError,
    send: getNextTasks,
  } = useGet<ITaskTrail[]>({
    url: '/task_trails/limited',
    lazy: true,
  });

  const {
    loading: previousTasksLoading,
    data: previousTasksData,
    error: previousTasksError,
    send: getPreviousTasks,
  } = useGet<ITaskTrail[]>({
    url: '/task_trails/limited',
    lazy: true,
  });

  useEffect(() => {
    if (taskError) {
      toast({ message: taskError, severity: 'error' });

      return;
    }

    if (taskTypesError) {
      toast({ message: taskTypesError, severity: 'error' });

      return;
    }

    if (nextTasksError) {
      toast({ message: nextTasksError, severity: 'error' });

      return;
    }

    if (tagsError) {
      toast({ message: tagsError, severity: 'error' });

      return;
    }

    if (previousTasksError) {
      toast({ message: previousTasksError, severity: 'error' });
    }
  }, [taskTypesError, toast, closeModal, nextTasksError, previousTasksError, taskError, tagsError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ITaskTrailSchema>({
    resolver: yupResolver(taskTrailSchema),
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

  const previousTasksOptions = useMemo(() => {
    const options = !previousTasksData ? [] : previousTasksData;

    if (taskData) {
      const defaulOptionsNotPresent = taskData.previousTasks.filter(
        (dvc) => !options.find((vc) => vc.id === dvc.id),
      );

      options.push(...(defaulOptionsNotPresent as any));
    }

    return options;
  }, [previousTasksData, taskData]);

  const nextTasksOptions = useMemo(() => {
    const options = !nextTasksData ? [] : nextTasksData;

    if (taskData) {
      const defaulOptionsNotPresent = taskData.nextTasks.filter(
        (dvc) => !options.find((vc) => vc.id === dvc.id),
      );

      options.push(...(defaulOptionsNotPresent as any));
    }

    return options;
  }, [nextTasksData, taskData]);

  const defaultTags = useMemo(() => {
    if (!taskData || !taskData.tagsGroup) {
      return [];
    }

    return taskData.tagsGroup.tags.map((tag) => tag.name);
  }, [taskData]);

  const onSubmit = useCallback(
    async ({ taskType, nextTasks, previousTasks, name, tags }: ITaskTrailSchema) => {
      const nextTasksIds = nextTasks.map((task) => task.id);
      const previousTasksIds = previousTasks.map((task) => task.id);

      const { error: updateErrors } = await updateTask({
        name,
        task_type_id: taskType.id,
        next_tasks_ids: nextTasksIds,
        previous_tasks_ids: previousTasksIds,
        tags,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'tarefa atualizada', severity: 'success' });

      closeModal();
    },
    [updateTask, reloadList, toast, closeModal],
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

              <Grid item xs={12}>
                <FormSelectAsync
                  multiple
                  freeSolo
                  control={control}
                  name="tags"
                  label="Tags"
                  options={tagsData || []}
                  defaultValue={defaultTags}
                  margin_type="no-margin"
                  errors={errors.tags}
                  loading={tagsLoading}
                  handleOpen={() => getTags()}
                  handleFilter={(params) =>
                    getTags({
                      params: { ...params?.params },
                    })
                  }
                  limitFilter={100}
                  filterField="name"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  sx={(theme) => ({
                    width: '100%',
                    textAlign: 'center',
                    background: theme.palette.secondary.main,
                    padding: '0.7rem',
                    margin: '1rem 0',
                  })}
                >
                  Dependencias
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  multiple
                  control={control}
                  name="previousTasks"
                  label="Tarefas Anteriores"
                  options={previousTasksOptions}
                  optionLabel="name"
                  optionValue="id"
                  defaultValue={taskData.previousTasks}
                  margin_type="no-margin"
                  errors={errors.previousTasks as any}
                  loading={previousTasksLoading}
                  handleOpen={() => getPreviousTasks({ params: { trail_id } })}
                  handleFilter={(params) =>
                    getPreviousTasks({
                      params: { ...params?.params, trail_id },
                    })
                  }
                  limitFilter={limitedTaskTrailLength}
                  filterField="name"
                  helperText="Tarefas que precisão ser concluidas antes dessa iniciar"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  multiple
                  control={control}
                  name="nextTasks"
                  label="Proximas Tarefas"
                  options={nextTasksOptions}
                  optionLabel="name"
                  defaultValue={taskData.nextTasks}
                  margin_type="no-margin"
                  optionValue="id"
                  errors={errors.nextTasks as any}
                  loading={nextTasksLoading}
                  handleOpen={() => getNextTasks({ params: { trail_id } })}
                  handleFilter={(params) =>
                    getNextTasks({
                      params: { ...params?.params, trail_id },
                    })
                  }
                  limitFilter={limitedTaskTrailLength}
                  filterField="name"
                  helperText="Tarefas que precisam que essa termine para poderem iniciar"
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
