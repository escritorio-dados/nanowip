import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IDocumentType, IDocumentTypeInput } from '#shared/types/backend/costs/IDocumentType';

import { documentTypeSchema, IDocumentTypeSchema } from '../../schema/documentType.schema';

type ICreateDocumentTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  handleAdd(data: IDocumentType): void;
};

export function CreateDocumentTypeModal({
  openModal,
  closeModal,
  handleAdd,
}: ICreateDocumentTypeModal) {
  const { toast } = useToast();

  const { send: createDocumentType, loading: createLoading } = usePost<
    IDocumentType,
    IDocumentTypeInput
  >('document_types');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IDocumentTypeSchema>({
    resolver: yupResolver(documentTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: IDocumentTypeSchema) => {
      const { error: createErrors, data } = await createDocumentType({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as IDocumentType);

      toast({ message: 'tipo de documento criado', severity: 'success' });

      closeModal();
    },
    [createDocumentType, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Tipo de Documento"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <CustomButton type="submit">Cadastrar Tipo de Documento</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
