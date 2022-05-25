import { Box, Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ITask } from '#shared/types/backend/ITask';
import { getStatusText } from '#shared/utils/getStatusText';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldContainer, FieldValueContainer, TagsContainer } from './styles';

type IInfoTaskModal = { openModal: boolean; closeModal: () => void; task_id: string };

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
                <Typography component="strong">Status: </Typography>

                <Typography>{taskInfo.status}</Typography>
              </FieldValueContainer>
            </Grid>

            {taskInfo.link && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 'bold' })}
                  >
                    Link:
                  </Typography>

                  <CustomButton
                    size="small"
                    color="info"
                    margin_type="left-margin"
                    onClick={() => window.open(taskInfo.link)}
                  >
                    Acessar
                  </CustomButton>
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Prazo: </Typography>

                <Typography>{taskInfo.deadline}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Disponivel em: </Typography>

                <Typography>{taskInfo.availableDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Iniciado em </Typography>

                <Typography>{taskInfo.startDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Finalizado em: </Typography>

                <Typography>{taskInfo.endDate}</Typography>
              </FieldValueContainer>
            </Grid>

            {taskInfo.path.map((path) => (
              <Grid item xs={12} sm={6} key={path.id}>
                <FieldValueContainer>
                  <Typography component="strong">{path.entity}: </Typography>

                  <Typography>{path.name}</Typography>
                </FieldValueContainer>
              </Grid>
            ))}

            <Grid item xs={12}>
              <FieldContainer>
                <Typography component="strong">Tarefas Anteriores: </Typography>

                <TagsContainer>
                  {taskInfo.previousTasks.map((task) => (
                    <Typography component="span" key={task.id}>
                      {task.pathString}
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
                      {task.pathString}
                    </Typography>
                  ))}
                </TagsContainer>
              </FieldContainer>
            </Grid>

            <Grid item xs={12}>
              <FieldContainer>
                <Typography component="strong">Descrição: </Typography>

                <Box>
                  <Typography whiteSpace="pre-wrap" marginLeft="2rem">
                    {taskInfo.description}
                  </Typography>
                </Box>
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
