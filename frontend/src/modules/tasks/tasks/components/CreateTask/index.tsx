import { yupResolver } from '@hookform/resolvers/yup';
import { Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelectAsync } from '#shared/components/inputs/CustomSelectAsync';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { ITaskSchema, taskSchema } from '#modules/tasks/tasks/schemas/task.schema';
import { ITask, ITaskInput, limitedTaskLength } from '#modules/tasks/tasks/types/ITask';
import { ITaskType, limitedTaskTypesLength } from '#modules/tasks/taskTypes/types/ITaskType';

type ICreateTaskModal = IReloadModal & {
  valueChain: { id: string; pathString: string; name: string };
};

type ISelectedTasks = { id: string; pathString: string };

export function CreateTaskModal({
  openModal,
  closeModal,
  reloadList,
  valueChain,
}: ICreateTaskModal) {
  const [selectedValueChain, setSelectedValueChain] = useState(() => {
    const path = valueChain.pathString.split(' | ');

    return {
      ...valueChain,
      pathString: `${valueChain.name} | ${path.slice(0, path.length - 1).join(' | ')}`,
    };
  });
  const [selectedPreviousTasks, setSelectPreviousTasks] = useState<ISelectedTasks[]>([]);
  const [selectedNextTasks, setSelectNextTasks] = useState<ISelectedTasks[]>([]);

  const { toast } = useToast();

  const { send: createTask, loading: createLoading } = usePost<ITask, ITaskInput>('tasks');

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
    loading: valueChainsLoading,
    data: valueChainsData,
    error: valueChainsError,
    send: getValueChains,
  } = useGet<ITask[]>({
    url: '/value_chains/limited',
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
  } = useGet<ITask[]>({
    url: '/tasks/limited',
    lazy: true,
  });

  const {
    loading: previousTasksLoading,
    data: previousTasksData,
    error: previousTasksError,
    send: getPreviousTasks,
  } = useGet<ITask[]>({
    url: '/tasks/limited',
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

    if (valueChainsError) {
      toast({ message: valueChainsError, severity: 'error' });

      return;
    }

    if (tagsError) {
      toast({ message: tagsError, severity: 'error' });

      return;
    }

    if (previousTasksError) {
      toast({ message: previousTasksError, severity: 'error' });
    }
  }, [
    taskTypesError,
    toast,
    closeModal,
    nextTasksError,
    previousTasksError,
    valueChainsError,
    tagsError,
  ]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    getValues,
  } = useForm<ITaskSchema>({
    resolver: yupResolver(taskSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const valueChainsOptions = useMemo(() => {
    const options = !valueChainsData ? [] : valueChainsData;

    const filter = options.find((vc) => vc.id === valueChain.id);

    if (!filter) {
      const path = valueChain.pathString.split(' | ');

      options.push({
        ...valueChain,
        pathString: path.splice(0, path.length - 1).join(' | '),
      } as any);
    }

    return options;
  }, [valueChain, valueChainsData]);

  const previousTasksOptions = useMemo(() => {
    const options = !previousTasksData ? [] : previousTasksData;

    if (selectedPreviousTasks) {
      const optionsNotPresent = selectedPreviousTasks.filter(
        (svc) => !options.find((vc) => vc.id === svc.id),
      );

      if (optionsNotPresent.length > 0) {
        options.push(...(optionsNotPresent as any));
      }
    }

    return options;
  }, [previousTasksData, selectedPreviousTasks]);

  const nextTasksOptions = useMemo(() => {
    const options = !nextTasksData ? [] : nextTasksData;

    if (selectedNextTasks) {
      const optionsNotPresent = selectedNextTasks.filter(
        (svc) => !options.find((vc) => vc.id === svc.id),
      );

      if (optionsNotPresent.length > 0) {
        options.push(...(optionsNotPresent as any));
      }
    }

    return options;
  }, [nextTasksData, selectedNextTasks]);

  const handleChangeValueChain = useCallback(
    (newValueChain: ISelectedTasks) => {
      setSelectPreviousTasks(getValues().previousTasks);

      setSelectNextTasks(getValues().nextTasks);

      getPreviousTasks({ params: { value_chain_id: newValueChain.id } });

      getNextTasks({ params: { value_chain_id: newValueChain.id } });

      setSelectedValueChain(newValueChain as any);
    },
    [getNextTasks, getPreviousTasks, getValues],
  );

  const onSubmit = useCallback(
    async ({ taskType, nextTasks, previousTasks, ...rest }: ITaskSchema) => {
      const nextTasksIds = nextTasks.map((task) => task.id);
      const previousTasksIds = previousTasks.map((task) => task.id);

      const { error: createErrors } = await createTask({
        ...removeEmptyFields(rest),
        task_type_id: taskType.id,
        value_chain_id: valueChain.id,
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
    [createTask, valueChain.id, reloadList, toast, closeModal],
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

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="deadline"
                label="Prazo"
                errors={errors.deadline}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="availableDate"
                label="Data de Disponibilidade"
                errors={errors.availableDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="startDate"
                label="Data de Inicio"
                errors={errors.startDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="endDate"
                label="Data de Término"
                errors={errors.endDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextField
                name="link"
                label="Link"
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
                control={control}
                errors={errors.description}
                margin_type="no-margin"
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
                defaultValue={[]}
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

            <Grid item xs={12}>
              <CustomSelectAsync
                value={selectedValueChain}
                onChange={handleChangeValueChain}
                label="Cadeia de Valor (Tarefas)"
                options={valueChainsOptions}
                optionValue="id"
                optionLabel="pathString"
                margin_type="no-margin"
                errors={errors.nextTasks as any}
                loading={valueChainsLoading}
                handleOpen={() => getValueChains({ params: { value_chain_id: valueChain.id } })}
                handleFilter={(params) =>
                  getValueChains({
                    params: { ...params?.params, value_chain_id: valueChain.id },
                  })
                }
                limitFilter={limitedTaskLength}
                filterField="name"
                helperText="As Tarefas (Proximas e Anteriores) vão aparecer de acordo com a cadeia de valor selecionada"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelectAsync
                multiple
                control={control}
                name="previousTasks"
                label="Tarefas Anteriores"
                options={previousTasksOptions}
                optionLabel="pathString"
                optionValue="id"
                defaultValue={[]}
                margin_type="no-margin"
                errors={errors.previousTasks as any}
                loading={previousTasksLoading}
                handleOpen={() =>
                  getPreviousTasks({ params: { value_chain_id: selectedValueChain.id } })
                }
                handleFilter={(params) =>
                  getPreviousTasks({
                    params: { ...params?.params, value_chain_id: selectedValueChain.id },
                  })
                }
                limitFilter={limitedTaskLength}
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
                optionLabel="pathString"
                optionValue="id"
                defaultValue={[]}
                margin_type="no-margin"
                errors={errors.nextTasks as any}
                loading={nextTasksLoading}
                handleOpen={() =>
                  getNextTasks({ params: { value_chain_id: selectedValueChain.id } })
                }
                handleFilter={(params) =>
                  getNextTasks({
                    params: { ...params?.params, value_chain_id: selectedValueChain.id },
                  })
                }
                limitFilter={limitedTaskLength}
                filterField="name"
                helperText="Tarefas que precisam que essa termine para poderem iniciar"
              />
            </Grid>
          </Grid>

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
