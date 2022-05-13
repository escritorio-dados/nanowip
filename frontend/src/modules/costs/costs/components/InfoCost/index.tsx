import { Box, Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICost } from '#shared/types/backend/costs/ICost';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoCostModal = {
  openModal: boolean;
  closeModal: () => void;
  cost_id: string;
};

export function InfoCostModal({ closeModal, cost_id, openModal }: IInfoCostModal) {
  const { toast } = useToast();

  const {
    loading: costLoading,
    data: costData,
    error: costError,
  } = useGet<ICost>({ url: `/costs/${cost_id}` });

  useEffect(() => {
    if (costError) {
      toast({ message: costError, severity: 'error' });

      closeModal();
    }
  }, [costError, toast, closeModal]);

  const costInfo = useMemo(() => {
    if (!costData) {
      return null;
    }

    return {
      ...costData,
      value: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
        costData.value,
      ),
      dueDate: parseDateApi(costData.dueDate, 'dd/MM/yyyy', '-'),
      issueDate: parseDateApi(costData.issueDate, 'dd/MM/yyyy', '-'),
      paymentDate: parseDateApi(costData.paymentDate, 'dd/MM/yyyy', '-'),
      created_at: parseDateApi(costData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(costData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [costData]);

  if (costLoading) return <Loading loading={costLoading} />;

  return (
    <>
      {costInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Custo"
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Motivo: </Typography>

                <Typography>{costInfo.reason}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Valor: </Typography>

                <Typography>{costInfo.value}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Status: </Typography>

                <Typography>{costInfo.status}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Data de Lançamento: </Typography>

                <Typography>{costInfo.issueDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Data de Vencimento: </Typography>

                <Typography>{costInfo.dueDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Data de Pagamento: </Typography>

                <Typography>{costInfo.paymentDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Prestador do Serviço: </Typography>

                <Typography>{costInfo.serviceProvider?.name}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Tipo de Documento: </Typography>

                <Typography>{costInfo.documentType?.name}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Numero do Documento: </Typography>

                <Typography>{costInfo.documentNumber}</Typography>
              </FieldValueContainer>
            </Grid>

            {costInfo.documentLink && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 'bold' })}
                  >
                    Link:
                  </Typography>

                  <CustomButton
                    size="small"
                    color="info"
                    margin_type="left-margin"
                    onClick={() => window.open(costInfo.documentLink)}
                  >
                    Acessar
                  </CustomButton>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <FieldValueContainer>
                <Typography component="strong">Descrição: </Typography>

                <Typography whiteSpace="pre-wrap">{costInfo.description}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Criado em: </Typography>

                <Typography>{costInfo.created_at}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Atualizado em: </Typography>

                <Typography>{costInfo.updated_at}</Typography>
              </FieldValueContainer>
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
