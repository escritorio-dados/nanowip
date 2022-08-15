import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IBaseModal } from '#shared/types/IModal';

type IDeleteMilestoneModal = IBaseModal & {
  milestone: { id: string; name: string };
  reloadList?: () => void;
};

export function DeleteMilestoneModal({
  closeModal,
  milestone,
  openModal,
  reloadList,
}: IDeleteMilestoneModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteMilestone } = useDelete(
    `/milestones/${milestone.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!milestone) {
      return;
    }

    const { error } = await deleteMilestone();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'milestone excluido', severity: 'success' });

    closeModal();
  }, [milestone, deleteMilestone, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Milestone"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o milestone:</Typography>

        <TextConfirm>{milestone.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
