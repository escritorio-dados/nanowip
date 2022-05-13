import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IAssignment } from '#shared/types/backend/IAssignment';
import { getDurationSeconds, parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoAssignmentModal = {
  openModal: boolean;
  closeModal: () => void;
  assignment_id: string;
};

export function InfoAssignmentModal({
  closeModal,
  assignment_id,
  openModal,
}: IInfoAssignmentModal) {
  const { toast } = useToast();

  const {
    loading: assignmentLoading,
    data: assignmentData,
    error: assignmentError,
  } = useGet<IAssignment>({ url: `/assignments/${assignment_id}` });

  useEffect(() => {
    if (assignmentError) {
      toast({ message: assignmentError, severity: 'error' });

      closeModal();
    }
  }, [assignmentError, toast, closeModal]);

  const assignmentInfo = useMemo(() => {
    if (!assignmentData) {
      return null;
    }

    const { trackerInProgress } = assignmentData;

    return {
      ...assignmentData,
      timeLimitText: getDurationSeconds({
        duration: assignmentData.timeLimit || 0,
        zeroString: '-',
      }),
      startDate: parseDateApi(assignmentData.startDate, 'dd/MM/yyyy (HH:mm)', '-'),
      endDate: parseDateApi(assignmentData.endDate, 'dd/MM/yyyy (HH:mm)', '-'),
      created_at: parseDateApi(assignmentData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(assignmentData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      trackerInProgress: trackerInProgress
        ? {
            ...trackerInProgress,
            start: parseDateApi(trackerInProgress.start, 'dd/MM/yyyy (HH:mm)', '-'),
          }
        : undefined,
      taskName: assignmentData.path.task.name,
      path: Object.values(assignmentData.path).slice(1).reverse(),
    };
  }, [assignmentData]);

  if (assignmentLoading) return <Loading loading={assignmentLoading} />;

  return (
    <>
      {assignmentInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Atribuição"
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Tarefa: </Typography>

                <Typography>{assignmentInfo.taskName}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Colaborador: </Typography>

                <Typography>{assignmentInfo.collaborator.name}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Status: </Typography>

                <Typography>{assignmentInfo.status}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Tempo Limite: </Typography>

                <Typography>{assignmentInfo.timeLimitText}</Typography>
              </FieldValueContainer>
            </Grid>

            {Object.values(assignmentInfo.path).map((path) => (
              <Grid item xs={12} sm={6} key={path.id}>
                <FieldValueContainer>
                  <Typography component="strong">{path.entity}: </Typography>

                  <Typography>{path.name}</Typography>
                </FieldValueContainer>
              </Grid>
            ))}

            {assignmentInfo.trackerInProgress && (
              <Grid item xs={12} sm={6}>
                <FieldValueContainer>
                  <Typography component="strong">Tracker em andamento desde: </Typography>

                  <Typography>{assignmentInfo.trackerInProgress.start}</Typography>
                </FieldValueContainer>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Data de inicio: </Typography>

                <Typography>{assignmentInfo.startDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Ultimo Tracker finalizado em: </Typography>

                <Typography>{assignmentInfo.endDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Criado em: </Typography>

                <Typography>{assignmentInfo.created_at}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Atualizado em: </Typography>

                <Typography>{assignmentInfo.updated_at}</Typography>
              </FieldValueContainer>
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
