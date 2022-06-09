import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteCollaboratorStatusModal = IDeleteModal & {
  collaboratorStatus: { id: string; date: string; collaborator: string };
};

export function DeleteCollaboratorStatusModal({
  closeModal,
  collaboratorStatus,
  openModal,
  updateList,
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

    updateList(collaboratorStatus.id);

    toast({ message: 'status do colaborador excluido', severity: 'success' });

    closeModal();
  }, [collaboratorStatus, deleteCollaboratorStatus, updateList, toast, closeModal]);

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

        <TextConfirm>
          {collaboratorStatus.date} - {collaboratorStatus.collaborator}
        </TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
