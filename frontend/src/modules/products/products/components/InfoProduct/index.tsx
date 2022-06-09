import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { getStatusText } from '#shared/utils/getStatusText';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IProduct } from '#modules/products/products/types/IProduct';

type IInfoProductModal = IBaseModal & { product_id: string };

export function InfoProductModal({ closeModal, product_id, openModal }: IInfoProductModal) {
  const { toast } = useToast();

  const {
    loading: productLoading,
    data: productData,
    error: productError,
  } = useGet<IProduct>({ url: `/products/${product_id}` });

  useEffect(() => {
    if (productError) {
      toast({ message: productError, severity: 'error' });

      closeModal();
    }
  }, [productError, toast, closeModal]);

  const productInfo = useMemo(() => {
    if (!productData) {
      return null;
    }

    return {
      ...productData,
      startDate: parseDateApi(productData.startDate, 'dd/MM/yyyy (HH:mm)', '-'),
      deadline: parseDateApi(productData.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
      availableDate: parseDateApi(productData.availableDate, 'dd/MM/yyyy (HH:mm)', '-'),
      endDate: parseDateApi(productData.endDate, 'dd/MM/yyyy (HH:mm)', '-'),
      created_at: parseDateApi(productData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(productData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      status: getStatusText(productData.statusDate),
      productType: productData.productType.name,
      measure: productData.measure.name,
      quantity: productData.quantity.toString().replace('.', ','),
    };
  }, [productData]);

  if (productLoading) return <Loading loading={productLoading} />;

  return (
    <>
      {productInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Produto"
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LabelValue label="Nome:" value={productInfo.name} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Local:" value={productInfo.pathString} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Tipo de Produto:" value={productInfo.productType} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Unidade de Medida:" value={productInfo.measure} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Quantidade:" value={productInfo.quantity} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Status:" value={productInfo.status} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Prazo:" value={productInfo.deadline} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Disponivel em:" value={productInfo.availableDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Iniciado em:" value={productInfo.startDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Finalizado em:" value={productInfo.endDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={productInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={productInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
