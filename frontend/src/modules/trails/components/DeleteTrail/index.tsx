import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteTrailModal = {
  openModal: boolean;
  closeModal: () => void;
  trail: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteTrailModal({
  closeModal,
  trail,
  openModal,
  handleDeleteData,
}: IDeleteTrailModal) {
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

    handleDeleteData(trail.id);

    toast({ message: 'trilha excluida', severity: 'success' });

    closeModal();
  }, [trail, deleteTrail, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Trilha" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar a trilha:</Typography>

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
          {trail.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
