import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteTrailModal = IDeleteModal & { trail: { id: string; name: string } };

export function DeleteTrailModal({ closeModal, trail, openModal, updateList }: IDeleteTrailModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteTrail } = useDelete(`/trails/${trail.id}`);

  const handleDelete = useCallback(async () => {
    if (!trail) {
      return;
    }

    const { error } = await deleteTrail();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(trail.id);

    toast({ message: 'trilha excluida', severity: 'success' });

    closeModal();
  }, [trail, deleteTrail, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Trilha" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar a trilha:</Typography>

        <TextConfirm>{trail.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
