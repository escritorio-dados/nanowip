import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteTrackerModal = {
  openModal: boolean;
  closeModal: () => void;
  tracker: { id: string; name: string };
  reloadList: () => void;
};

export function DeleteTrackerModal({
  closeModal,
  tracker,
  openModal,
  reloadList,
}: IDeleteTrackerModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteTracker } = useDelete(`/trackers/${tracker.id}`);

  const handleDelete = useCallback(async () => {
    if (!tracker) {
      return;
    }

    const { error } = await deleteTracker();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'tracker deletado', severity: 'success' });

    closeModal();
  }, [tracker, deleteTracker, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Tracker" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o tracker:</Typography>

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
          {tracker.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
