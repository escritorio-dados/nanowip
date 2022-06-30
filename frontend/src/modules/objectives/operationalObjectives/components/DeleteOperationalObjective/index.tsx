import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteOperationalObjectiveModal = IDeleteModal & {
  operationalObjective: { id: string; name: string };
};

export function DeleteOperationalObjectiveModal({
  closeModal,
  operationalObjective,
  openModal,
  updateList,
}: IDeleteOperationalObjectiveModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteOperationalObjective } = useDelete(
    `/operational_objectives/${operationalObjective.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!operationalObjective) {
      return;
    }

    const { error } = await deleteOperationalObjective();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(operationalObjective.id);

    toast({ message: 'objetivo operacional excluido', severity: 'success' });

    closeModal();
  }, [operationalObjective, deleteOperationalObjective, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Objetivo Operacional"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o objetivo operacional:</Typography>

        <TextConfirm>{operationalObjective.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
