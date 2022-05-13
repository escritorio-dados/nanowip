import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICollaborator } from '#shared/types/backend/ICollaborator';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoCollaboratorModal = {
  openModal: boolean;
  closeModal: () => void;
  collaborator_id: string;
};

export function InfoCollaboratorModal({
  closeModal,
  collaborator_id,
  openModal,
}: IInfoCollaboratorModal) {
  const { toast } = useToast();

  const {
    loading: collaboratorLoading,
    data: collaboratorData,
    error: collaboratorError,
  } = useGet<ICollaborator>({ url: `/collaborators/${collaborator_id}` });

  useEffect(() => {
    if (collaboratorError) {
      toast({ message: collaboratorError, severity: 'error' });

      closeModal();
    }
  }, [collaboratorError, toast, closeModal]);

  const collaboratorInfo = useMemo(() => {
    if (!collaboratorData) {
      return null;
    }

    return {
      ...collaboratorData,
      created_at: parseDateApi(collaboratorData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(collaboratorData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [collaboratorData]);

  if (collaboratorLoading) return <Loading loading={collaboratorLoading} />;

  return (
    <>
      {collaboratorInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Colaborador"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{collaboratorInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Tipo: </Typography>

            <Typography>{collaboratorInfo.type}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Cargo: </Typography>

            <Typography>{collaboratorInfo.jobTitle}</Typography>
          </FieldValueContainer>

          {collaboratorInfo.user && (
            <FieldValueContainer>
              <Typography component="strong">Usuario: </Typography>

              <Typography>{collaboratorInfo.user.email}</Typography>
            </FieldValueContainer>
          )}

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{collaboratorInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{collaboratorInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
