import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeletePortfolioModal = {
  openModal: boolean;
  closeModal: () => void;
  portfolio: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeletePortfolioModal({
  closeModal,
  portfolio,
  openModal,
  handleDeleteData,
}: IDeletePortfolioModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deletePortfolio } = useDelete(
    `/portfolios/${portfolio.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!portfolio) {
      return;
    }

    const { error } = await deletePortfolio();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(portfolio.id);

    toast({ message: 'portfólio excluido', severity: 'success' });

    closeModal();
  }, [portfolio, deletePortfolio, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Portfolio"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o portfolio:</Typography>

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
          {portfolio.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
