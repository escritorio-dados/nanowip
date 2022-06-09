import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ICost } from '#modules/costs/costs/types/ICost';

type IInfoCostModal = IBaseModal & { cost_id: string };

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
              <LabelValue label="Motivo:" value={costInfo.reason} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Valor:" value={costInfo.value} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Status:" value={costInfo.status} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Data de Lançamento:" value={costInfo.issueDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Data de Vencimento:" value={costInfo.dueDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Data de Pagamento:" value={costInfo.paymentDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Prestador do Serviço:" value={costInfo.serviceProvider?.name} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Tipo de Documento:" value={costInfo.documentType?.name} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Numero do Documento:" value={costInfo.documentNumber} />
            </Grid>

            {costInfo.documentLink && (
              <Grid item xs={12} sm={6}>
                <LabelValue
                  label="Link:"
                  value={
                    <CustomButton
                      size="small"
                      color="info"
                      margin_type="no-margin"
                      onClick={() => window.open(costInfo.documentLink)}
                      fullWidth={false}
                    >
                      Acessar
                    </CustomButton>
                  }
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <LabelValue
                display="block"
                label="Descrição:"
                value={
                  <Typography whiteSpace="pre-wrap" marginLeft="2rem">
                    {costInfo.description}
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={costInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={costInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
