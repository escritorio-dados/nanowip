import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteUserModal = {
  openModal: boolean;
  closeModal: () => void;
  user: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteUserModal({
  closeModal,
  user,
  openModal,
  handleDeleteData,
}: IDeleteUserModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteUser } = useDelete(`/users/${user.id}`);

  const handleDelete = useCallback(async () => {
    if (!user) {
      return;
    }
    const { error } = await deleteUser();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(user.id);

    toast({ message: 'usuario deletado', severity: 'success' });

    closeModal();
  }, [closeModal, deleteUser, handleDeleteData, toast, user]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Usuario" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o usuario:</Typography>

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
          {user.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
