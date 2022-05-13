import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IProductType, IProductTypeInput } from '#shared/types/backend/IProductType';

import {
  IProductTypeSchema,
  productTypeSchema,
} from '#modules/productTypes/schema/productType.schema';

type IUpdateProductTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  productType_id: string;
  handleUpdateData: (id: string, newData: IProductType) => void;
};

export function UpdateProductTypeModal({
  closeModal,
  openModal,
  productType_id,
  handleUpdateData,
}: IUpdateProductTypeModal) {
  const { toast } = useToast();

  const {
    loading: productTypeLoading,
    data: productTypeData,
    error: productTypeError,
  } = useGet<IProductType>({ url: `/product_types/${productType_id}` });

  const { send: updateProductType, loading: updateLoading } = usePut<
    IProductType,
    IProductTypeInput
  >(`/product_types/${productType_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IProductTypeSchema>({
    resolver: yupResolver(productTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (productTypeError) {
      toast({ message: productTypeError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, productTypeError, toast]);

  const onSubmit = useCallback(
    async ({ name }: IProductTypeSchema) => {
      const { error: updateErrors, data } = await updateProductType({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      handleUpdateData(productType_id, data as IProductType);

      toast({ message: 'tipo de produto atualizado', severity: 'success' });

      closeModal();
    },
    [updateProductType, handleUpdateData, productType_id, toast, closeModal],
  );

  if (productTypeLoading) return <Loading loading={productTypeLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {productTypeData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar tipo de produto - ${productTypeData.name}`}
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={productTypeData.name}
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
