import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IReloadModal } from '#shared/types/IModal';

type IDeleteCostModal = IReloadModal & { cost: { id: string; name: string } };

export function DeleteCostModal({ closeModal, cost, openModal, reloadList }: IDeleteCostModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteCost } = useDelete(`/costs/${cost.id}`);

  const handleDelete = useCallback(async () => {
    if (!cost) {
      return;
    }

    const { error } = await deleteCost();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'custo excluido', severity: 'success' });

    closeModal();
  }, [cost, deleteCost, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Custo" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o custo:</Typography>

        <TextConfirm>{cost.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
