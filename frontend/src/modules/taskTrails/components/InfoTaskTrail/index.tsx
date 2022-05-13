import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ITaskTrail } from '#shared/types/backend/ITaskTrail';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldContainer, FieldValueContainer, TagsContainer } from './styles';

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
              <FieldValueContainer>
                <Typography component="strong">Nome: </Typography>

                <Typography>{taskInfo.name}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Tipo de Tarefa: </Typography>

                <Typography>{taskInfo.taskType}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Trilha: </Typography>

                <Typography>{taskInfo.trail.name}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12}>
              <FieldContainer>
                <Typography component="strong">Tarefas Anteriores: </Typography>

                <TagsContainer>
                  {taskInfo.previousTasks.map((task) => (
                    <Typography component="span" key={task.id}>
                      {task.name}
                    </Typography>
                  ))}
                </TagsContainer>
              </FieldContainer>
            </Grid>

            <Grid item xs={12}>
              <FieldContainer>
                <Typography component="strong">Proximas Tarefas: </Typography>

                <TagsContainer>
                  {taskInfo.nextTasks.map((task) => (
                    <Typography component="span" key={task.id}>
                      {task.name}
                    </Typography>
                  ))}
                </TagsContainer>
              </FieldContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Criado em: </Typography>

                <Typography>{taskInfo.created_at}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Atualizado em: </Typography>

                <Typography>{taskInfo.updated_at}</Typography>
              </FieldValueContainer>
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
