import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteProductTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  productType: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteProductTypeModal({
  closeModal,
  productType,
  openModal,
  handleDeleteData,
}: IDeleteProductTypeModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteProductType } = useDelete(
    `/product_types/${productType.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!productType) {
      return;
    }

    const { error } = await deleteProductType();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(productType.id);

    toast({ message: 'tipo de produto excluido', severity: 'success' });

    closeModal();
  }, [productType, deleteProductType, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Tipo de Produto"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o tipo de produto:</Typography>

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
          {productType.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
