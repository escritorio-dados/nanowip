import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IBaseModal } from '#shared/types/IModal';

type IDeleteDeliverableTagModal = IBaseModal & {
  deliverable: { id: string; name: string };
  reloadList?: () => void;
};

export function DeleteDeliverableTagModal({
  closeModal,
  deliverable,
  openModal,
  reloadList,
}: IDeleteDeliverableTagModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteDeliverableTag } = useDelete(
    `/deliverable_tags/${deliverable.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!deliverable) {
      return;
    }

    const { error } = await deleteDeliverableTag();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'entregável excluido', severity: 'success' });

    closeModal();
  }, [deliverable, deleteDeliverableTag, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Entregável"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o entregável:</Typography>

        <TextConfirm>{deliverable.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
