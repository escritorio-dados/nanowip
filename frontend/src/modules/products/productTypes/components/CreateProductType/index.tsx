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
  IProductTypeSchema,
  productTypeSchema,
} from '#modules/products/productTypes/schema/productType.schema';
import { IProductType, IProductTypeInput } from '#modules/products/productTypes/types/IProductType';

export function CreateProductTypeModal({
  openModal,
  closeModal,
  addList,
}: IAddModal<IProductType>) {
  const { toast } = useToast();

  const { send: createProductType, loading: createLoading } = usePost<
    IProductType,
    IProductTypeInput
  >('product_types');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IProductTypeSchema>({
    resolver: yupResolver(productTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: IProductTypeSchema) => {
      const { error: createErrors, data } = await createProductType({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data as IProductType);

      toast({ message: 'tipo de produto criado', severity: 'success' });

      closeModal();
    },
    [createProductType, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Tipo de Produto"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
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
