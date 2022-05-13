import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IProductType } from '#shared/types/backend/IProductType';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoProductTypeModal = { openModal: boolean; closeModal: () => void; productType_id: string };

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
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{productTypeInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{productTypeInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{productTypeInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
