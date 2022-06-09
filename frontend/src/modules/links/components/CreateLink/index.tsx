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
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { linkSchema, ILinkSchema } from '#modules/links/schema/link.schema';
import { ILink, ILinkInput } from '#modules/links/types/ILink';

export function CreateLinkModal({ openModal, closeModal, addList }: IAddModal<ILink>) {
  const { toast } = useToast();

  const { send: createLink, loading: createLoading } = usePost<ILink, ILinkInput>('links');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ILinkSchema>({
    resolver: yupResolver(linkSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async (input: ILinkSchema) => {
      const { error: createErrors, data } = await createLink(removeEmptyFields(input));

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data);

      toast({ message: 'link criado', severity: 'success' });

      closeModal();
    },
    [createLink, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Cadastrar Link" maxWidth="sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="title"
            label="Titulo"
            control={control}
            errors={errors.title}
            margin_type="no-margin"
          />

          <FormTextField required name="url" label="Link" control={control} errors={errors.url} />

          <FormTextField
            name="category"
            label="Categoria"
            control={control}
            errors={errors.category}
          />

          <FormTextField name="owner" label="Responsavel" control={control} errors={errors.owner} />

          <FormTextField
            multiline
            name="description"
            label="Descrição"
            control={control}
            errors={errors.description}
          />

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
