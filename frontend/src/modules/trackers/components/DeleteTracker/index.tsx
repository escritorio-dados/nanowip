import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IReloadModal } from '#shared/types/IModal';

type IDeleteTrackerModal = IReloadModal & {
  tracker: { id: string; name: string };
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

        <TextConfirm>{tracker.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
