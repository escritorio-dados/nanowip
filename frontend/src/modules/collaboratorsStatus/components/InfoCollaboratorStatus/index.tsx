import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICollaboratorStatus } from '#shared/types/backend/ICollaboratorStatus';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoCollaboratorStatusModal = {
  openModal: boolean;
  closeModal: () => void;
  collaboratorStatus_id: string;
};

export function InfoCollaboratorStatusModal({
  closeModal,
  collaboratorStatus_id,
  openModal,
}: IInfoCollaboratorStatusModal) {
  const { toast } = useToast();

  const {
    loading: collaboratorStatusLoading,
    data: collaboratorStatusData,
    error: collaboratorStatusError,
  } = useGet<ICollaboratorStatus>({ url: `/collaborators_status/${collaboratorStatus_id}` });

  useEffect(() => {
    if (collaboratorStatusError) {
      toast({ message: collaboratorStatusError, severity: 'error' });

      closeModal();
    }
  }, [collaboratorStatusError, toast, closeModal]);

  const collaboratorStatusInfo = useMemo(() => {
    if (!collaboratorStatusData) {
      return null;
    }

    return {
      ...collaboratorStatusData,
      date: parseDateApi(collaboratorStatusData.date, "LLLL 'de' yyyy", '-'),
      salary: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
        collaboratorStatusData.salary,
      ),
      created_at: parseDateApi(collaboratorStatusData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(collaboratorStatusData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [collaboratorStatusData]);

  if (collaboratorStatusLoading) return <Loading loading={collaboratorStatusLoading} />;

  return (
    <>
      {collaboratorStatusInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Status do Colaborador"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Data: </Typography>

            <Typography>{collaboratorStatusInfo.date}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Salario: </Typography>

            <Typography>{collaboratorStatusInfo.salary}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Horas Trabalhadas: </Typography>

            <Typography>{collaboratorStatusInfo.monthHours}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Colaborador: </Typography>

            <Typography>{collaboratorStatusInfo.collaborator.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{collaboratorStatusInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{collaboratorStatusInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
