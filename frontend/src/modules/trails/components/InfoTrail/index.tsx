import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ITrail } from '#shared/types/backend/ITrail';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoTrailModal = { openModal: boolean; closeModal: () => void; trail_id: string };

export function InfoTrailModal({ closeModal, trail_id, openModal }: IInfoTrailModal) {
  const { toast } = useToast();

  const {
    loading: trailLoading,
    data: trailData,
    error: trailError,
  } = useGet<ITrail>({ url: `/trails/${trail_id}` });

  useEffect(() => {
    if (trailError) {
      toast({ message: trailError, severity: 'error' });

      closeModal();
    }
  }, [trailError, toast, closeModal]);

  const trailInfo = useMemo(() => {
    if (!trailData) {
      return null;
    }

    return {
      ...trailData,
      created_at: parseDateApi(trailData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(trailData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [trailData]);

  if (trailLoading) return <Loading loading={trailLoading} />;

  return (
    <>
      {trailInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Trilha"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{trailInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{trailInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{trailInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
