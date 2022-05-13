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
import { useGet, usePost } from '#shared/services/useAxios';
import {
  ITaskTrail,
  ITaskTrailInput,
  limitedTaskTrailLength,
} from '#shared/types/backend/ITaskTrail';
import { ITaskType, limitedTaskTypesLength } from '#shared/types/backend/ITaskType';

import { ITaskTrailSchema, taskTrailSchema } from '#modules/taskTrails/schemas/taskTrail.schema';

type ICreateTaskTrailModal = {
  openModal: boolean;
  closeModal(): void;
  reloadList: () => void;
  trail_id: string;
};

export function CreateTaskTrailModal({
  openModal,
  closeModal,
  reloadList,
  trail_id,
}: ICreateTaskTrailModal) {
  const { toast } = useToast();

  const { send: createTaskTrail, loading: createLoading } = usePost<ITaskTrail, ITaskTrailInput>(
    'task_trails',
  );

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
    send: getPreviousTaskTrails,
  } = useGet<ITaskTrail[]>({
    url: '/task_trails/limited',
    lazy: true,
  });

  useEffect(() => {
    if (taskTypesError) {
      toast({ message: taskTypesError, severity: 'error' });

      return;
    }

    if (nextTasksError) {
      toast({ message: nextTasksError, severity: 'error' });

      return;
    }

    if (previousTasksError) {
      toast({ message: previousTasksError, severity: 'error' });
    }
  }, [taskTypesError, toast, closeModal, nextTasksError, previousTasksError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ITaskTrailSchema>({
    resolver: yupResolver(taskTrailSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const previousTasksOptions = useMemo(() => {
    const options = !previousTasksData ? [] : previousTasksData;

    return options;
  }, [previousTasksData]);

  const nextTasksOptions = useMemo(() => {
    const options = !nextTasksData ? [] : nextTasksData;

    return options;
  }, [nextTasksData]);

  const onSubmit = useCallback(
    async ({ taskType, nextTasks, previousTasks, name }: ITaskTrailSchema) => {
      const nextTasksIds = nextTasks.map((taskTrail) => taskTrail.id);
      const previousTasksIds = previousTasks.map((taskTrail) => taskTrail.id);

      const { error: createErrors } = await createTaskTrail({
        name,
        task_type_id: taskType.id,
        trail_id,
        next_tasks_ids: nextTasksIds,
        previous_tasks_ids: previousTasksIds,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'tarefa criada', severity: 'success' });

      closeModal();
    },
    [createTaskTrail, trail_id, reloadList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Cadastrar Tarefa" maxWidth="md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormTextField
                required
                name="name"
                label="Nome"
                control={control}
                errors={errors.name}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelectAsync
                required
                control={control}
                name="taskType"
                label="Tipo de Tarefa"
                options={taskTypesData || []}
                optionLabel="name"
                optionValue="id"
                defaultValue={null}
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
                defaultValue={[]}
                margin_type="no-margin"
                errors={errors.previousTasks as any}
                loading={previousTasksLoading}
                handleOpen={() => getPreviousTaskTrails({ params: { trail_id } })}
                handleFilter={(params) =>
                  getPreviousTaskTrails({
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
                optionValue="id"
                defaultValue={[]}
                margin_type="no-margin"
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

          <CustomButton type="submit">Cadastrar Tarefa</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
