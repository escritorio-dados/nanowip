import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteProductTypeModal = IDeleteModal & { productType: { id: string; name: string } };

export function DeleteProductTypeModal({
  closeModal,
  productType,
  openModal,
  updateList,
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

    updateList(productType.id);

    toast({ message: 'tipo de produto excluido', severity: 'success' });

    closeModal();
  }, [productType, deleteProductType, updateList, toast, closeModal]);

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

        <TextConfirm>{productType.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
