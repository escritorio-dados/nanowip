import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteCostDistributionModal = {
  openModal: boolean;
  closeModal: () => void;
  costDistribution: { id: string; name: string };
  reloadList: () => void;
};

export function DeleteCostDistributionModal({
  closeModal,
  costDistribution,
  openModal,
  reloadList,
}: IDeleteCostDistributionModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteCostDistribution } = useDelete(
    `/cost_distributions/${costDistribution.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!costDistribution) {
      return;
    }

    const { error } = await deleteCostDistribution();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'distribuição do custo deletada', severity: 'success' });

    closeModal();
  }, [costDistribution, deleteCostDistribution, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Distribuição do Custo"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar a distribuição do custo:</Typography>

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
          {costDistribution.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
