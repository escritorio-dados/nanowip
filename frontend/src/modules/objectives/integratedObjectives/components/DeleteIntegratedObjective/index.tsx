import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteIntegratedObjectiveModal = IDeleteModal & {
  integratedObjective: { id: string; name: string };
};

export function DeleteIntegratedObjectiveModal({
  closeModal,
  integratedObjective,
  openModal,
  updateList,
}: IDeleteIntegratedObjectiveModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteIntegratedObjective } = useDelete(
    `/integrated_objectives/${integratedObjective.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!integratedObjective) {
      return;
    }

    const { error } = await deleteIntegratedObjective();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(integratedObjective.id);

    toast({ message: 'objetivo integrado excluido', severity: 'success' });

    closeModal();
  }, [integratedObjective, deleteIntegratedObjective, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Objetivo Integrado"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o objetivo integrado:</Typography>

        <TextConfirm>{integratedObjective.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
