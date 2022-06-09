import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteCollaboratorModal = IDeleteModal & { collaborator: { id: string; name: string } };

export function DeleteCollaboratorModal({
  closeModal,
  collaborator,
  openModal,
  updateList,
}: IDeleteCollaboratorModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteCollaborator } = useDelete(
    `/collaborators/${collaborator.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!collaborator) {
      return;
    }

    const { error } = await deleteCollaborator();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(collaborator.id);

    toast({ message: 'colaborador excluido', severity: 'success' });

    closeModal();
  }, [collaborator, deleteCollaborator, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Colaborador"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o colaborador:</Typography>

        <TextConfirm>{collaborator.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
