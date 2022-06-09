import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { getDurationDates, parseDateApi } from '#shared/utils/parseDateApi';

import { ITracker } from '#modules/trackers/types/ITracker';

type IInfoTrackerModal = IBaseModal & { tracker_id: string };

export function InfoTrackerModal({ closeModal, tracker_id, openModal }: IInfoTrackerModal) {
  const { toast } = useToast();

  const {
    loading: trackerLoading,
    data: trackerData,
    error: trackerError,
  } = useGet<ITracker>({ url: `/trackers/${tracker_id}` });

  useEffect(() => {
    if (trackerError) {
      toast({ message: trackerError, severity: 'error' });

      closeModal();
    }
  }, [trackerError, toast, closeModal]);

  const trackerInfo = useMemo(() => {
    if (!trackerData) {
      return null;
    }

    const path = trackerData.path ? Object.values(trackerData.path).reverse() : undefined;

    return {
      ...trackerData,
      start: parseDateApi(trackerData.start, 'dd/MM/yyyy (HH:mm)', '-'),
      end: parseDateApi(trackerData.end, 'dd/MM/yyyy (HH:mm)', '-'),
      created_at: parseDateApi(trackerData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(trackerData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      duration: getDurationDates(trackerData.start, trackerData.end),
      path,
    };
  }, [trackerData]);

  if (trackerLoading) return <Loading loading={trackerLoading} />;

  return (
    <>
      {trackerInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do tracker"
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LabelValue label="Colaborador:" value={trackerInfo.collaborator.name} />
            </Grid>

            {trackerInfo.reason && (
              <Grid item xs={12} sm={6}>
                <LabelValue label="Motivo:" value={trackerInfo.reason} />
              </Grid>
            )}

            {trackerInfo.path && (
              <>
                {Object.values(trackerInfo.path).map((path) => (
                  <Grid item xs={12} sm={6} key={path.id}>
                    <LabelValue label={`${path.entity}:`} value={path.name} />
                  </Grid>
                ))}
              </>
            )}

            <Grid item xs={12} sm={6}>
              <LabelValue label="Inicio:" value={trackerInfo.start} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Fim:" value={trackerInfo.end} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Duração:" value={trackerInfo.duration} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={trackerInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={trackerInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
