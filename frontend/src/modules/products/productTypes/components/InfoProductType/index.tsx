import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IProductType } from '#modules/products/productTypes/types/IProductType';

type IInfoProductTypeModal = IBaseModal & { productType_id: string };

export function InfoProductTypeModal({
  closeModal,
  productType_id,
  openModal,
}: IInfoProductTypeModal) {
  const { toast } = useToast();

  const {
    loading: productTypeLoading,
    data: productTypeData,
    error: productTypeError,
  } = useGet<IProductType>({ url: `/product_types/${productType_id}` });

  useEffect(() => {
    if (productTypeError) {
      toast({ message: productTypeError, severity: 'error' });

      closeModal();
    }
  }, [productTypeError, toast, closeModal]);

  const productTypeInfo = useMemo(() => {
    if (!productTypeData) {
      return null;
    }

    return {
      ...productTypeData,
      created_at: parseDateApi(productTypeData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(productTypeData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [productTypeData]);

  if (productTypeLoading) return <Loading loading={productTypeLoading} />;

  return (
    <>
      {productTypeInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Tipo de Produto"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={productTypeInfo.name} />

          <LabelValue label="Criado em:" value={productTypeInfo.created_at} />

          <LabelValue label="Atualizado em:" value={productTypeInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
