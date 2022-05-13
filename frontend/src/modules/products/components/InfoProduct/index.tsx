import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IProduct } from '#shared/types/backend/IProduct';
import { getStatusText } from '#shared/utils/getStatusText';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoProductModal = { openModal: boolean; closeModal: () => void; product_id: string };

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
              <FieldValueContainer>
                <Typography component="strong">Nome: </Typography>

                <Typography>{productInfo.name}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Local: </Typography>

                <Typography>{productInfo.pathString}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Tipo de Produto: </Typography>

                <Typography>{productInfo.productType}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Unidade de Medida: </Typography>

                <Typography>{productInfo.measure}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Quantidade: </Typography>

                <Typography>{productInfo.quantity}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Status: </Typography>

                <Typography>{productInfo.status}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Prazo: </Typography>

                <Typography>{productInfo.deadline}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Disponivel em: </Typography>

                <Typography>{productInfo.availableDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Iniciado em </Typography>

                <Typography>{productInfo.startDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Finalizado em: </Typography>

                <Typography>{productInfo.endDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Criado em: </Typography>

                <Typography>{productInfo.created_at}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Atualizado em: </Typography>

                <Typography>{productInfo.updated_at}</Typography>
              </FieldValueContainer>
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
