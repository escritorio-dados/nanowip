import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteDocumentTypeModal = IDeleteModal & { documentType: { id: string; name: string } };

export function DeleteDocumentTypeModal({
  closeModal,
  documentType,
  openModal,
  updateList,
}: IDeleteDocumentTypeModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteDocumentType } = useDelete(
    `/document_types/${documentType.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!documentType) {
      return;
    }

    const { error } = await deleteDocumentType();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(documentType.id);

    toast({ message: 'tipo de documento excluido', severity: 'success' });

    closeModal();
  }, [documentType, deleteDocumentType, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Tipo de documento"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o tipo de documento:</Typography>

        <TextConfirm>{documentType.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
