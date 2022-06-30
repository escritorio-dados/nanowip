import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteDeliverableModal = Omit<IDeleteModal, 'updateList'> & {
  deliverable: { id: string; name: string; section_id: string };
  updateList: (id: string, section_id: string) => void;
};

export function DeleteDeliverableModal({
  closeModal,
  deliverable,
  openModal,
  updateList,
}: IDeleteDeliverableModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteDeliverable } = useDelete(
    `/deliverables/${deliverable.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!deliverable) {
      return;
    }

    const { error } = await deleteDeliverable();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(deliverable.id, deliverable.section_id);

    toast({ message: 'entregável excluido', severity: 'success' });

    closeModal();
  }, [deliverable, deleteDeliverable, updateList, toast, closeModal]);

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
