import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { TagsInfo } from '#shared/components/info/TagsInfo';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ITaskTrail } from '#modules/trails/taskTrails/types/ITaskTrail';

type IInfoTaskTrailModal = { openModal: boolean; closeModal: () => void; task_id: string };

export function InfoTaskTrailModal({ closeModal, task_id, openModal }: IInfoTaskTrailModal) {
  const { toast } = useToast();

  const {
    loading: taskLoading,
    data: taskData,
    error: taskError,
  } = useGet<ITaskTrail>({ url: `/task_trails/${task_id}` });

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
      created_at: parseDateApi(taskData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(taskData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      taskType: taskData.taskType.name,
      tags: taskData.tagsGroup ? taskData.tagsGroup.tags.map((tag) => tag.name) : [],
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
              <LabelValue label="Trilha:" value={taskInfo.trail.name} />
            </Grid>

            <Grid item xs={12}>
              <TagsInfo
                label="Tarefas Anteriores:"
                tagsData={taskInfo.previousTasks}
                getId={(data) => data.id}
                getValue={(data) => data.name}
              />
            </Grid>

            <Grid item xs={12}>
              <TagsInfo
                label="Proximas Tarefas:"
                tagsData={taskInfo.nextTasks}
                getId={(data) => data.id}
                getValue={(data) => data.name}
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
