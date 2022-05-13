import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteRoleModal = {
  openModal: boolean;
  closeModal: () => void;
  role: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteRoleModal({
  closeModal,
  role,
  openModal,
  handleDeleteData,
}: IDeleteRoleModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteRole } = useDelete(`/roles/${role.id}`);

  const handleDelete = useCallback(async () => {
    if (!role) {
      return;
    }

    const { error } = await deleteRole();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(role.id);

    toast({ message: 'papel deletado', severity: 'success' });

    closeModal();
  }, [role, deleteRole, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Papel" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o papel:</Typography>

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
          {role.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
