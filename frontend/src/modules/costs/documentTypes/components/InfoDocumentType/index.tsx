import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IDocumentType } from '#shared/types/backend/costs/IDocumentType';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoDocumentTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  document_type_id: string;
};

export function InfoDocumentTypeModal({
  closeModal,
  document_type_id,
  openModal,
}: IInfoDocumentTypeModal) {
  const { toast } = useToast();

  const {
    loading: documentTypeLoading,
    data: documentTypeData,
    error: documentTypeError,
  } = useGet<IDocumentType>({ url: `/document_types/${document_type_id}` });

  useEffect(() => {
    if (documentTypeError) {
      toast({ message: documentTypeError, severity: 'error' });

      closeModal();
    }
  }, [documentTypeError, toast, closeModal]);

  const documentTypeInfo = useMemo(() => {
    if (!documentTypeData) {
      return null;
    }

    return {
      ...documentTypeData,
      created_at: parseDateApi(documentTypeData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(documentTypeData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [documentTypeData]);

  if (documentTypeLoading) return <Loading loading={documentTypeLoading} />;

  return (
    <>
      {documentTypeInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Tipo de documento"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{documentTypeInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{documentTypeInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{documentTypeInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
