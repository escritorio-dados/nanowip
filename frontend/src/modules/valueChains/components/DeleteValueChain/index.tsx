import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IReloadModal } from '#shared/types/IModal';

type IDeleteValueChainModal = IReloadModal & { valueChain: { id: string; name: string } };

export function DeleteValueChainModal({
  closeModal,
  valueChain,
  openModal,
  reloadList,
}: IDeleteValueChainModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteValueChain } = useDelete(
    `/value_chains/${valueChain.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!valueChain) {
      return;
    }

    const { error } = await deleteValueChain();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'cadeia de valor excluida', severity: 'success' });

    closeModal();
  }, [valueChain, deleteValueChain, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Cadeia de valor"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar a cadeia de valor:</Typography>

        <TextConfirm>{valueChain.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
