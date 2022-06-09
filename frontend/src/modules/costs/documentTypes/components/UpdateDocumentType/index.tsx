import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IUpdateModal } from '#shared/types/IModal';

import {
  IDocumentType,
  IDocumentTypeInput,
} from '#modules/costs/documentTypes/types/IDocumentType';

import { documentTypeSchema, IDocumentTypeSchema } from '../../schema/documentType.schema';

type IUpdateDocumentTypeModal = IUpdateModal<IDocumentType> & {
  document_type_id: string;
};

export function UpdateDocumentTypeModal({
  closeModal,
  document_type_id,
  openModal,
  updateList,
}: IUpdateDocumentTypeModal) {
  const { toast } = useToast();

  const {
    loading: documentTypeLoading,
    data: documentTypeData,
    error: documentTypeError,
  } = useGet<IDocumentType>({ url: `/document_types/${document_type_id}` });

  const { send: updateDocumentType, loading: updateLoading } = usePut<
    IDocumentType,
    IDocumentTypeInput
  >(`/document_types/${document_type_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IDocumentTypeSchema>({
    resolver: yupResolver(documentTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (documentTypeError) {
      toast({ message: documentTypeError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, documentTypeError, toast]);

  const onSubmit = useCallback(
    async ({ name }: IDocumentTypeSchema) => {
      const { error: updateErrors, data } = await updateDocumentType({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(document_type_id, data);

      toast({ message: 'tipo de documento atualizado', severity: 'success' });

      closeModal();
    },
    [updateDocumentType, updateList, document_type_id, toast, closeModal],
  );

  if (documentTypeLoading) return <Loading loading={documentTypeLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {documentTypeData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar tipo de documento"
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={documentTypeData.name}
              control={control}
              errors={errors.name}
              margin_type="no-margin"
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
