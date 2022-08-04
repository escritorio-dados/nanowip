import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { TagsInfo } from '#shared/components/info/TagsInfo';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { getStatusText } from '#shared/utils/getStatusText';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ITask } from '#modules/tasks/tasks/types/ITask';

type IInfoTaskModal = IBaseModal & { task_id: string };

export function InfoTaskModal({ closeModal, task_id, openModal }: IInfoTaskModal) {
  const { toast } = useToast();

  const {
    loading: taskLoading,
    data: taskData,
    error: taskError,
  } = useGet<ITask>({ url: `/tasks/${task_id}` });

  useEffect(() => {
    if (taskError) {
      toast({ message: taskError, severity: 'error' });

      closeModal();
    }
  }, [taskError, toast, closeModal]);

  const taskInfo = useMemo(() => {
    if (!taskData) {
      return null;
    }

    return {
      ...taskData,
      startDate: parseDateApi(taskData.startDate, 'dd/MM/yyyy (HH:mm)', '-'),
      deadline: parseDateApi(taskData.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
      availableDate: parseDateApi(taskData.availableDate, 'dd/MM/yyyy (HH:mm)', '-'),
      endDate: parseDateApi(taskData.endDate, 'dd/MM/yyyy (HH:mm)', '-'),
      created_at: parseDateApi(taskData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(taskData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      status: getStatusText(taskData.statusDate),
      taskType: taskData.taskType.name,
      tags: taskData.tagsGroup ? taskData.tagsGroup.tags.map((tag) => tag.name) : [],
      path: [...Object.values(taskData.path)].reverse(),
    };
  }, [taskData]);

  if (taskLoading) return <Loading loading={taskLoading} />;

  return (
    <>
      {taskInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Tarefa"
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LabelValue label="Nome:" value={taskInfo.name} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Tipo de Tarefa:" value={taskInfo.taskType} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Status:" value={taskInfo.status} />
            </Grid>

            {taskInfo.link && (
              <Grid item xs={12} sm={6}>
                <LabelValue
                  label="Link:"
                  value={
                    <CustomButton
                      size="small"
                      color="info"
                      margin_type="no-margin"
                      onClick={() => window.open(taskInfo.link)}
                      fullWidth={false}
                    >
                      Acessar
                    </CustomButton>
                  }
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <LabelValue label="Prazo:" value={taskInfo.deadline} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Disponivel em:" value={taskInfo.availableDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Iniciado em:" value={taskInfo.startDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Finalizado em:" value={taskInfo.endDate} />
            </Grid>

            {taskInfo.path.map((path) => (
              <Grid item xs={12} sm={6} key={path.id}>
                <LabelValue label={`${path.entity}:`} value={path.name} />
              </Grid>
            ))}

            <Grid item xs={12}>
              <TagsInfo
                label="Tarefas Anteriores:"
                tagsData={taskInfo.previousTasks}
                getId={(data) => data.id}
                getValue={(data) => data.pathString}
              />
            </Grid>

            <Grid item xs={12}>
              <TagsInfo
                label="Proximas Tarefas:"
                tagsData={taskInfo.nextTasks}
                getId={(data) => data.id}
                getValue={(data) => data.pathString}
              />
            </Grid>

            <Grid item xs={12}>
              <LabelValue
                display="block"
                label="Descrição:"
                value={
                  <Typography whiteSpace="pre-wrap" marginLeft="2rem">
                    {taskInfo.description}
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TagsInfo
                label="Tags:"
                tagsData={taskInfo.tags}
                getId={(data) => data}
                getValue={(data) => data}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={taskInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={taskInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
