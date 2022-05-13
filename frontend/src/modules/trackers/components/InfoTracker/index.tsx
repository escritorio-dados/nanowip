import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ITracker } from '#shared/types/backend/ITracker';
import { getDurationDates, parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoTrackerModal = {
  openModal: boolean;
  closeModal: () => void;
  tracker_id: string;
};

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
              <FieldValueContainer>
                <Typography component="strong">Colaborador: </Typography>

                <Typography>{trackerInfo.collaborator.name}</Typography>
              </FieldValueContainer>
            </Grid>

            {trackerInfo.reason && (
              <Grid item xs={12} sm={6}>
                <FieldValueContainer>
                  <Typography component="strong">Motivo: </Typography>

                  <Typography>{trackerInfo.reason}</Typography>
                </FieldValueContainer>
              </Grid>
            )}

            {trackerInfo.path && (
              <>
                {Object.values(trackerInfo.path).map((path) => (
                  <Grid item xs={12} sm={6} key={path.id}>
                    <FieldValueContainer>
                      <Typography component="strong">{path.entity}: </Typography>

                      <Typography>{path.name}</Typography>
                    </FieldValueContainer>
                  </Grid>
                ))}
              </>
            )}

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Inicio: </Typography>

                <Typography>{trackerInfo.start}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Fim: </Typography>

                <Typography>{trackerInfo.end}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Duração: </Typography>

                <Typography>{trackerInfo.duration}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Criado em: </Typography>

                <Typography>{trackerInfo.created_at}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Atualizado em: </Typography>

                <Typography>{trackerInfo.updated_at}</Typography>
              </FieldValueContainer>
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
