import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { getDurationSeconds, parseDateApi } from '#shared/utils/parseDateApi';

import { IAssignment } from '#modules/assignments/types/IAssignment';

type IInfoAssignmentModal = IBaseModal & { assignment_id: string };

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
      deadline: parseDateApi(assignmentData.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
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
              <LabelValue label="Tarefa:" value={assignmentInfo.taskName} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Colaborador:" value={assignmentInfo.collaborator.name} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Status:" value={assignmentInfo.status} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Tempo Limite:" value={assignmentInfo.timeLimitText} />
            </Grid>

            {Object.values(assignmentInfo.path).map((path) => (
              <Grid item xs={12} sm={6} key={path.id}>
                <LabelValue label={`${path.entity}:`} value={path.name} />
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <LabelValue label="Prazo da tarefa:" value={assignmentInfo.deadline} />
            </Grid>

            {assignmentInfo.trackerInProgress && (
              <Grid item xs={12} sm={6}>
                <LabelValue
                  label="Tracker em andamento desde:"
                  value={assignmentInfo.trackerInProgress.start}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <LabelValue label="Data de inicio:" value={assignmentInfo.startDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Ultimo Tracker finalizado em:" value={assignmentInfo.endDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={assignmentInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={assignmentInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
