import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IMeasure } from '#shared/types/backend/IMeasure';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoMeasureModal = { openModal: boolean; closeModal: () => void; measure_id: string };

export function InfoMeasureModal({ closeModal, measure_id, openModal }: IInfoMeasureModal) {
  const { toast } = useToast();

  const {
    loading: measureLoading,
    data: measureData,
    error: measureError,
  } = useGet<IMeasure>({ url: `/measures/${measure_id}` });

  useEffect(() => {
    if (measureError) {
      toast({ message: measureError, severity: 'error' });

      closeModal();
    }
  }, [measureError, toast, closeModal]);

  const measureInfo = useMemo(() => {
    if (!measureData) {
      return null;
    }

    return {
      ...measureData,
      created_at: parseDateApi(measureData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(measureData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [measureData]);

  if (measureLoading) return <Loading loading={measureLoading} />;

  return (
    <>
      {measureInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Unidade de Medida"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{measureInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{measureInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{measureInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
