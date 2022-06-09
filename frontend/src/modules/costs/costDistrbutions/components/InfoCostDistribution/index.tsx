import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ICostDistribution } from '#modules/costs/costDistrbutions/types/ICostDistribution';

type IInfoCostDistributionModal = IBaseModal & { cost_distribution_id: string };

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
              <LabelValue label="Custo:" value={costDistributionInfo.cost.reason} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Porcentagem:" value={costDistributionInfo.percent} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Valor:" value={costDistributionInfo.value} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Tipo de Tarefa:" value={costDistributionInfo.taskType?.name} />
            </Grid>

            {Object.values(costDistributionInfo.path).map((path) => (
              <Grid item xs={12} sm={6} key={path.id}>
                <LabelValue label={`${path.entity}:`} value={path.name} />
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={costDistributionInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={costDistributionInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
