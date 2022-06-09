import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IAddModal } from '#shared/types/IModal';

import {
  IDocumentType,
  IDocumentTypeInput,
} from '#modules/costs/documentTypes/types/IDocumentType';

import { documentTypeSchema, IDocumentTypeSchema } from '../../schema/documentType.schema';

export function CreateDocumentTypeModal({
  openModal,
  closeModal,
  addList,
}: IAddModal<IDocumentType>) {
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

      addList(data as IDocumentType);

      toast({ message: 'tipo de documento criado', severity: 'success' });

      closeModal();
    },
    [createDocumentType, addList, toast, closeModal],
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

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
