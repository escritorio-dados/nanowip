import { Container, Grid, Typography } from '@mui/material';
import { isToday, nextSunday, setMinutes, setSeconds } from 'date-fns';
import { isAfter, isBefore, setHours } from 'date-fns/esm';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomCollapse } from '#shared/components/CustomCollapse';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { Loading } from '#shared/components/Loading';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost, usePut } from '#shared/services/useAxios';
import { IAssignment } from '#shared/types/backend/IAssignment';
import { IStartTrackerInput, ITracker } from '#shared/types/backend/ITracker';
import { IPathObject } from '#shared/types/backend/shared/ICommonApi';
import { getDurationSeconds, parseDateApi } from '#shared/utils/parseDateApi';

import { ConfirmChangeStatusTaskModal } from '#modules/personal/components/ConfirmChangeStatusTask';
import { DescriptionAssignmentModal } from '#modules/personal/components/DescriptionAssignment';
import { StartTrackerModal } from '#modules/personal/components/StartTracker';
import { TrackerCard, ITrackerCardData } from '#modules/personal/components/TrackerCard';

type IEndTaskModal = { id: string; path: IPathObject } | null;
type IDescAssignment = { description?: string; link?: string } | null;

type ITrackerActive = ITracker & { deadline: string; timeLimit?: number };

export function AvailableAssignmentsPersonal() {
  const [startTrackerModal, setStartTrackerModal] = useState(false);
  const [endTaskModal, setEndTaskModal] = useState<IEndTaskModal>(null);
  const [descAssignment, setDescAssignment] = useState<IDescAssignment>(null);

  const { updateTitle } = useTitle();
  const { toast } = useToast();

  const {
    error: assignmentsError,
    loading: assignmentsLoading,
    data: assignmentsData,
    send: getAssignments,
  } = useGet<IAssignment[]>({ url: '/assignments/personal/available' });

  const {
    error: trackerActiveError,
    loading: trackerActiveLoading,
    data: trackerActiveData,
    send: getTrackerActive,
  } = useGet<ITrackerActive>({ url: '/trackers/active' });

  const { loading: startLoading, send: startTracker } = usePost<ITracker, IStartTrackerInput>(
    '/trackers/start',
  );

  const { loading: stopLoading, send: stopTracker } = usePut<ITracker, void>(
    `/trackers/stop/${trackerActiveData?.id || ''}`,
  );

  useEffect(() => {
    if (assignmentsError) {
      toast({ message: assignmentsError, severity: 'error' });

      return;
    }

    if (trackerActiveError) {
      toast({ message: trackerActiveError, severity: 'error' });
    }
  }, [trackerActiveError, toast, assignmentsError]);

  useEffect(() => {
    updateTitle('Minhas Tarefas Disponíveis');
  }, [updateTitle]);

  const assignments = useMemo(() => {
    if (!assignmentsData) {
      return {
        noDeadline: [],
        late: [],
        today: [],
        week: [],
        after: [],
      };
    }

    const noDeadline: ITrackerCardData[] = [];
    const late: ITrackerCardData[] = [];
    const today: ITrackerCardData[] = [];
    const week: ITrackerCardData[] = [];
    const after: ITrackerCardData[] = [];

    assignmentsData.forEach((assignment) => {
      const deadline = !assignment.deadline ? undefined : new Date(assignment.deadline);

      if (!deadline) {
        noDeadline.push({
          ...assignment,
          deadline: 'Sem Prazo',
          duration: assignment.duration || 0,
          durationText: getDurationSeconds({ duration: assignment.duration || 0 }),
          durationLimitText: assignment.timeLimit
            ? getDurationSeconds({
                duration: assignment.timeLimit || 0,
                zeroString: '-',
              })
            : undefined,
        });

        return;
      }

      if (isAfter(new Date(), deadline)) {
        late.push({
          ...assignment,
          deadline: parseDateApi(assignment.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
          duration: assignment.duration || 0,
          durationText: getDurationSeconds({ duration: assignment.duration || 0 }),
          durationLimitText: assignment.timeLimit
            ? getDurationSeconds({
                duration: assignment.timeLimit || 0,
                zeroString: '-',
              })
            : undefined,
        });

        return;
      }

      if (isToday(deadline)) {
        today.push({
          ...assignment,
          deadline: parseDateApi(assignment.deadline, "'Hoje' (HH:mm)", '-'),
          duration: assignment.duration || 0,
          durationText: getDurationSeconds({ duration: assignment.duration || 0 }),
          durationLimitText: assignment.timeLimit
            ? getDurationSeconds({
                duration: assignment.timeLimit || 0,
                zeroString: '-',
              })
            : undefined,
        });

        return;
      }

      const sunday = nextSunday(setSeconds(setMinutes(setHours(new Date(), 0), 0), 0));

      if (isBefore(deadline, sunday)) {
        week.push({
          ...assignment,
          deadline: parseDateApi(assignment.deadline, 'eeee (HH:mm)', '-'),
          duration: assignment.duration || 0,
          durationText: getDurationSeconds({ duration: assignment.duration || 0 }),
          durationLimitText: assignment.timeLimit
            ? getDurationSeconds({
                duration: assignment.timeLimit || 0,
                zeroString: '-',
              })
            : undefined,
        });
      } else {
        after.push({
          ...assignment,
          deadline: parseDateApi(assignment.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
          duration: assignment.duration || 0,
          durationText: getDurationSeconds({ duration: assignment.duration || 0 }),
          durationLimitText: assignment.timeLimit
            ? getDurationSeconds({
                duration: assignment.timeLimit || 0,
                zeroString: '-',
              })
            : undefined,
        });
      }
    });

    return {
      noDeadline,
      late,
      today,
      week,
      after,
    };
  }, [assignmentsData]);

  const activeAssignment = useMemo(() => {
    if (!trackerActiveData) {
      return undefined;
    }

    return {
      ...trackerActiveData,
      deadline: parseDateApi(trackerActiveData.deadline, 'dd/MM/yyyy (HH:mm)', 'Sem Prazo'),
      duration: trackerActiveData.duration || 0,
      durationText: getDurationSeconds({ duration: trackerActiveData.duration || 0 }),
      durationLimitText: trackerActiveData.timeLimit
        ? getDurationSeconds({
            duration: trackerActiveData.timeLimit || 0,
            zeroString: '',
          })
        : undefined,
    } as ITrackerCardData;
  }, [trackerActiveData]);

  const reloadList = useCallback(() => {
    getAssignments();

    getTrackerActive();
  }, [getAssignments, getTrackerActive]);

  const handleStartTracker = useCallback(
    async (assignment_id: string) => {
      const { error: startError } = await startTracker({ assignment_id });

      if (startError) {
        toast({ message: startError, severity: 'error' });

        return;
      }

      reloadList();
    },
    [reloadList, startTracker, toast],
  );

  const handleStopTracker = useCallback(async () => {
    const { error: stopError } = await stopTracker();

    if (stopError) {
      toast({ message: stopError, severity: 'error' });

      return;
    }

    reloadList();
  }, [reloadList, stopTracker, toast]);

  return (
    <>
      <Loading loading={assignmentsLoading} />

      <Loading loading={trackerActiveLoading} />

      <Loading loading={startLoading} />

      <Loading loading={stopLoading} />

      {endTaskModal && (
        <ConfirmChangeStatusTaskModal
          openModal={!!endTaskModal}
          closeModal={() => setEndTaskModal(null)}
          assignment={endTaskModal}
          reloadList={reloadList}
          status="Fechado"
        />
      )}

      {startTrackerModal && (
        <StartTrackerModal
          openModal={startTrackerModal}
          closeModal={() => setStartTrackerModal(false)}
          reloadList={reloadList}
        />
      )}

      {!!descAssignment && (
        <DescriptionAssignmentModal
          openModal={!!descAssignment}
          closeModal={() => setDescAssignment(null)}
          data={descAssignment}
        />
      )}

      <Container maxWidth="xl">
        <CustomCollapse
          stateKey="active_assignments"
          title="Em Andamento"
          customActions={
            <>
              <CustomIconButton
                action={() => setStartTrackerModal(true)}
                title="Iniciar Tracker"
                type="add"
                size="small"
              />
            </>
          }
        >
          {!activeAssignment ? (
            <Typography>Nenhuma tarefa</Typography>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TrackerCard
                  data={activeAssignment}
                  iconType="stop"
                  activeTimer
                  handleStartTracker={handleStartTracker}
                  handleStopTracker={handleStopTracker}
                  handleEndTask={(id, path) => setEndTaskModal({ id, path })}
                  handleShowDescription={(data) => setDescAssignment(data)}
                />
              </Grid>
            </Grid>
          )}
        </CustomCollapse>

        <CustomCollapse
          sx={{ marginTop: '2rem' }}
          stateKey="late_assignments"
          title={`Atrasados (${assignments.late.length})`}
        >
          {assignments.late.length === 0 ? (
            <Typography>Nenhuma tarefa</Typography>
          ) : (
            <Grid container spacing={2}>
              {assignments.late.map((assignment) => (
                <Grid key={assignment.id} item xs={12} sm={6} md={4}>
                  <TrackerCard
                    data={assignment}
                    iconType="start"
                    handleStartTracker={handleStartTracker}
                    handleStopTracker={handleStopTracker}
                    handleEndTask={(id, path) => setEndTaskModal({ id, path })}
                    handleShowDescription={(data) => setDescAssignment(data)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CustomCollapse>

        <CustomCollapse
          sx={{ marginTop: '2rem' }}
          stateKey="today_assignments"
          title={`Hoje (${assignments.today.length})`}
        >
          {assignments.today.length === 0 ? (
            <Typography>Nenhuma tarefa</Typography>
          ) : (
            <Grid container spacing={2}>
              {assignments.today.map((assignment) => (
                <Grid key={assignment.id} item xs={12} sm={6} md={4}>
                  <TrackerCard
                    data={assignment}
                    iconType="start"
                    handleStartTracker={handleStartTracker}
                    handleStopTracker={handleStopTracker}
                    handleEndTask={(id, path) => setEndTaskModal({ id, path })}
                    handleShowDescription={(data) => setDescAssignment(data)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CustomCollapse>

        <CustomCollapse
          sx={{ marginTop: '2rem' }}
          stateKey="week_assignments"
          title={`Semana (${assignments.week.length})`}
        >
          {assignments.week.length === 0 ? (
            <Typography>Nenhuma tarefa</Typography>
          ) : (
            <Grid container spacing={2}>
              {assignments.week.map((assignment) => (
                <Grid key={assignment.id} item xs={12} sm={6} md={4}>
                  <TrackerCard
                    data={assignment}
                    iconType="start"
                    handleStartTracker={handleStartTracker}
                    handleStopTracker={handleStopTracker}
                    handleEndTask={(id, path) => setEndTaskModal({ id, path })}
                    handleShowDescription={(data) => setDescAssignment(data)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CustomCollapse>

        <CustomCollapse
          sx={{ marginTop: '2rem' }}
          stateKey="after_assignments"
          title={`Posterior (${assignments.after.length})`}
        >
          {assignments.after.length === 0 ? (
            <Typography>Nenhuma tarefa</Typography>
          ) : (
            <Grid container spacing={2}>
              {assignments.after.map((assignment) => (
                <Grid key={assignment.id} item xs={12} sm={6} md={4}>
                  <TrackerCard
                    data={assignment}
                    iconType="start"
                    handleStartTracker={handleStartTracker}
                    handleStopTracker={handleStopTracker}
                    handleEndTask={(id, path) => setEndTaskModal({ id, path })}
                    handleShowDescription={(data) => setDescAssignment(data)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CustomCollapse>

        <CustomCollapse
          sx={{ marginTop: '2rem' }}
          stateKey="no_deadline_assignments"
          title={`Sem Prazo (${assignments.noDeadline.length})`}
        >
          {assignments.noDeadline.length === 0 ? (
            <Typography>Nenhuma tarefa</Typography>
          ) : (
            <Grid container spacing={2}>
              {assignments.noDeadline.map((assignment) => (
                <Grid key={assignment.id} item xs={12} sm={6} md={4}>
                  <TrackerCard
                    data={assignment}
                    iconType="start"
                    handleStartTracker={handleStartTracker}
                    handleStopTracker={handleStopTracker}
                    handleEndTask={(id, path) => setEndTaskModal({ id, path })}
                    handleShowDescription={(data) => setDescAssignment(data)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CustomCollapse>
      </Container>
    </>
  );
}
