import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteCollaboratorModal = {
  openModal: boolean;
  closeModal: () => void;
  collaborator: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteCollaboratorModal({
  closeModal,
  collaborator,
  openModal,
  handleDeleteData,
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

    handleDeleteData(collaborator.id);

    toast({ message: 'colaborador excluido', severity: 'success' });

    closeModal();
  }, [collaborator, deleteCollaborator, handleDeleteData, toast, closeModal]);

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
          {collaborator.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
