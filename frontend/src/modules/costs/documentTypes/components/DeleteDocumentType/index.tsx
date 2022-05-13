import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteDocumentTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  documentType: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteDocumentTypeModal({
  closeModal,
  documentType,
  openModal,
  handleDeleteData,
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

    handleDeleteData(documentType.id);

    toast({ message: 'tipo de documento excluido', severity: 'success' });

    closeModal();
  }, [documentType, deleteDocumentType, handleDeleteData, toast, closeModal]);

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
          {documentType.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
