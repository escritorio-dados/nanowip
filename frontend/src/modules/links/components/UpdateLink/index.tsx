import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { ILink, ILinkInput } from '#shared/types/backend/ILink';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { linkSchema, ILinkSchema } from '#modules/links/schema/link.schema';

type IUpdateLinkModal = {
  openModal: boolean;
  closeModal: () => void;
  link_id: string;
  handleUpdateData: (id: string, newData: ILink) => void;
};

export function UpdateLinkModal({
  closeModal,
  link_id,
  openModal,
  handleUpdateData,
}: IUpdateLinkModal) {
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

      handleUpdateData(link_id, data as ILink);

      toast({ message: 'link atualizado', severity: 'success' });

      closeModal();
    },
    [updateLink, handleUpdateData, link_id, toast, closeModal],
  );

  if (linkLoading) return <Loading loading={linkLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {linkData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar link - ${linkData.title}`}
          maxWidth="sm"
        >
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
              label="Categora"
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
              label="Descrição"
              control={control}
              errors={errors.description}
              defaultValue={linkData.description}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
