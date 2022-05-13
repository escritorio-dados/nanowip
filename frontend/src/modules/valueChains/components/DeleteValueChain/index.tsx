import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteValueChainModal = {
  openModal: boolean;
  closeModal: () => void;
  valueChain: { id: string; name: string };
  reloadList: () => void;
};

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
          {valueChain.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
