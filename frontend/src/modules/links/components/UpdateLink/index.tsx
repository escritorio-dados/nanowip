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
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { linkSchema, ILinkSchema } from '#modules/links/schema/link.schema';
import { ILink, ILinkInput } from '#modules/links/types/ILink';

type IUpdateLinkModal = IUpdateModal<ILink> & { link_id: string };

export function UpdateLinkModal({ closeModal, link_id, openModal, updateList }: IUpdateLinkModal) {
  const { toast } = useToast();

  const {
    loading: linkLoading,
    data: linkData,
    error: linkError,
  } = useGet<ILink>({ url: `/links/${link_id}` });

  const { send: updateLink, loading: updateLoading } = usePut<ILink, ILinkInput>(
    `/links/${link_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ILinkSchema>({
    resolver: yupResolver(linkSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (linkError) {
      toast({ message: linkError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, linkError, toast]);

  const onSubmit = useCallback(
    async ({ ...input }: ILinkSchema) => {
      const { error: updateErrors, data } = await updateLink(removeEmptyFields(input));

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(link_id, data as ILink);

      toast({ message: 'link atualizado', severity: 'success' });

      closeModal();
    },
    [updateLink, updateList, link_id, toast, closeModal],
  );

  if (linkLoading) return <Loading loading={linkLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {linkData && (
        <CustomDialog open={openModal} closeModal={closeModal} title="Editar link" maxWidth="sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              required
              name="title"
              label="Titulo"
              control={control}
              errors={errors.title}
              defaultValue={linkData.title}
              margin_type="no-margin"
            />

            <FormTextField
              required
              name="url"
              label="Link"
              control={control}
              errors={errors.url}
              defaultValue={linkData.url}
            />

            <FormTextField
              name="category"
              label="Categoria"
              control={control}
              errors={errors.category}
              defaultValue={linkData.category}
            />

            <FormTextField
              name="owner"
              label="Responsavel"
              control={control}
              errors={errors.owner}
              defaultValue={linkData.owner}
            />

            <FormTextField
              multiline
              name="description"
              label="Descri????o"
              control={control}
              errors={errors.description}
              defaultValue={linkData.description}
            />

            <CustomButton type="submit">Salvar Altera????es</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
