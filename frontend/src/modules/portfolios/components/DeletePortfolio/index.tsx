import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeletePortfolioModal = IDeleteModal & { portfolio: { id: string; name: string } };

export function DeletePortfolioModal({
  closeModal,
  portfolio,
  openModal,
  updateList,
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

    updateList(portfolio.id);

    toast({ message: 'portfólio excluido', severity: 'success' });

    closeModal();
  }, [portfolio, deletePortfolio, updateList, toast, closeModal]);

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

        <TextConfirm>{portfolio.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
