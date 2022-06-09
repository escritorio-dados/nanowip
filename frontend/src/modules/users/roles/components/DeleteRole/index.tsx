import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteRoleModal = IDeleteModal & { role: { id: string; name: string } };

export function DeleteRoleModal({ closeModal, role, openModal, updateList }: IDeleteRoleModal) {
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

    updateList(role.id);

    toast({ message: 'papel deletado', severity: 'success' });

    closeModal();
  }, [role, deleteRole, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Papel" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o papel:</Typography>

        <TextConfirm>{role.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
