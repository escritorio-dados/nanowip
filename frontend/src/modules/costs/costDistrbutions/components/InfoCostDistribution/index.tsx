import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICostDistribution } from '#shared/types/backend/costs/ICostDistribution';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoCostDistributionModal = {
  openModal: boolean;
  closeModal: () => void;
  cost_distribution_id: string;
};

export function InfoCostDistributionModal({
  closeModal,
  cost_distribution_id,
  openModal,
}: IInfoCostDistributionModal) {
  const { toast } = useToast();

  const {
    loading: costDistributionLoading,
    data: costDistributionData,
    error: costDistributionError,
  } = useGet<ICostDistribution>({ url: `/cost_distributions/${cost_distribution_id}` });

  useEffect(() => {
    if (costDistributionError) {
      toast({ message: costDistributionError, severity: 'error' });

      closeModal();
    }
  }, [costDistributionError, toast, closeModal]);

  const costDistributionInfo = useMemo(() => {
    if (!costDistributionData) {
      return null;
    }

    const percent = `${Math.round((costDistributionData.percent || 0) * 100)}%`;

    return {
      ...costDistributionData,
      percent,
      value: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
        costDistributionData.value,
      ),
      created_at: parseDateApi(costDistributionData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(costDistributionData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      path: Object.values(costDistributionData.path).reverse(),
    };
  }, [costDistributionData]);

  if (costDistributionLoading) return <Loading loading={costDistributionLoading} />;

  return (
    <>
      {costDistributionInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Distribuição do Custo"
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Custo: </Typography>

                <Typography>{costDistributionInfo.cost.reason}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Porcentagem: </Typography>

                <Typography>{costDistributionInfo.percent}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">valor: </Typography>

                <Typography>{costDistributionInfo.value}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Tipo de Tarefa: </Typography>

                <Typography>{costDistributionInfo.taskType?.name}</Typography>
              </FieldValueContainer>
            </Grid>

            {Object.values(costDistributionInfo.path).map((path) => (
              <Grid item xs={12} sm={6} key={path.id}>
                <FieldValueContainer>
                  <Typography component="strong">{path.entity}: </Typography>

                  <Typography>{path.name}</Typography>
                </FieldValueContainer>
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Criado em: </Typography>

                <Typography>{costDistributionInfo.created_at}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Atualizado em: </Typography>

                <Typography>{costDistributionInfo.updated_at}</Typography>
              </FieldValueContainer>
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
