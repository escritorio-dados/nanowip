import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteCollaboratorStatusModal = {
  openModal: boolean;
  closeModal: () => void;
  collaboratorStatus: { id: string; date: string; collaborator: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteCollaboratorStatusModal({
  closeModal,
  collaboratorStatus,
  openModal,
  handleDeleteData,
}: IDeleteCollaboratorStatusModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteCollaboratorStatus } = useDelete(
    `/collaborators_status/${collaboratorStatus.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!collaboratorStatus) {
      return;
    }

    const { error } = await deleteCollaboratorStatus();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(collaboratorStatus.id);

    toast({ message: 'status do colaborador excluido', severity: 'success' });

    closeModal();
  }, [collaboratorStatus, deleteCollaboratorStatus, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Status do Colaborador"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o status do colaborador:</Typography>

        <Typography
          component="strong"
          sx={{
            color: 'primary.main',
            marginTop: '1rem',
            display: 'block',
            width: '100%',
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          {collaboratorStatus.date} - {collaboratorStatus.collaborator}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
