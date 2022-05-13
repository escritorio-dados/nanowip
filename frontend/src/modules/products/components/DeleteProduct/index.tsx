import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteProductModal = {
  openModal: boolean;
  closeModal: () => void;
  product: { id: string; name: string };
  reloadList: () => void;
};

export function DeleteProductModal({
  closeModal,
  product,
  openModal,
  reloadList,
}: IDeleteProductModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteProduct } = useDelete(`/products/${product.id}`);

  const handleDelete = useCallback(async () => {
    if (!product) {
      return;
    }

    const { error } = await deleteProduct();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'produto excluido', severity: 'success' });

    closeModal();
  }, [product, deleteProduct, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Produto" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o produto:</Typography>

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
          {product.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
