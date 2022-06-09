import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IDocumentType } from '#modules/costs/documentTypes/types/IDocumentType';

type IInfoDocumentTypeModal = IBaseModal & { document_type_id: string };

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
          <LabelValue label="Nome:" value={documentTypeInfo.name} />

          <LabelValue label="Criado em:" value={documentTypeInfo.created_at} />

          <LabelValue label="Atualizado em:" value={documentTypeInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
