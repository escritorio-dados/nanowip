import { Box, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ICostDistribution } from '#modules/costs/costDistrbutions/types/ICostDistribution';

import { CreateCostDistributionModal } from '../CreateCostDistribution';
import { DeleteCostDistributionModal } from '../DeleteCostDistribution';
import { InfoCostDistributionModal } from '../InfoCostDistribution';
import { UpdateCostDistributionModal } from '../UpdateCostDistribution';
import { CostDistributionCard, Description, GridBox } from './styles';

type IInfoCostDistributionsTaskModal = {
  openModal: boolean;
  closeModal: (reload: boolean) => void;
  cost: { id: string; name: string; description: string };
};

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

export function InfoCostDistributionsTaskModal({
  closeModal,
  cost,
  openModal,
}: IInfoCostDistributionsTaskModal) {
  const [reloadTasks, setReloadTasks] = useState(false);
  const [createCostDistribution, setCreateCostDistribution] = useState(false);
  const [updateCostDistribution, setUpdateCostDistribution] = useState<IUpdateModal>(null);
  const [deleteCostDistribution, setDeleteCostDistribution] = useState<IDeleteModal>(null);
  const [infoCostDistribution, setInfoCostDistribution] = useState<IUpdateModal>(null);

  const { toast } = useToast();
  const { checkPermissions } = useAuth();

  const {
    loading: costDistributionsLoading,
    data: costDistributionsData,
    error: costDistributionsError,
    send: getCostDistributions,
  } = useGet<ICostDistribution[]>({
    url: `/cost_distributions`,
    config: { params: { cost_id: cost.id } },
  });

  useEffect(() => {
    if (costDistributionsError) {
      toast({ message: costDistributionsError, severity: 'error' });

      closeModal(false);
    }
  }, [costDistributionsError, toast, closeModal]);

  const permissions = useMemo(() => {
    return {
      createCostDistribution: checkPermissions([
        [PermissionsUser.create_cost_distribution, PermissionsUser.manage_cost_distribution],
      ]),
      updateCostDistribution: checkPermissions([
        [PermissionsUser.update_cost_distribution, PermissionsUser.manage_cost_distribution],
      ]),
      deleteCostDistribution: checkPermissions([
        [PermissionsUser.delete_cost_distribution, PermissionsUser.manage_cost_distribution],
      ]),
    };
  }, [checkPermissions]);

  const costDistributionsInfo = useMemo(() => {
    if (!costDistributionsData) {
      return [];
    }

    return costDistributionsData.map((costDistribution) => {
      const percent = `${((costDistribution.percent || 0) * 100).toFixed(2)}%`;

      return {
        ...costDistribution,
        percent,
        value: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
          costDistribution.value,
        ),
      };
    });
  }, [costDistributionsData]);

  const handleReloadList = useCallback(() => {
    getCostDistributions({ params: { cost_id: cost.id } });

    setReloadTasks(true);
  }, [cost.id, getCostDistributions]);

  if (costDistributionsLoading) return <Loading loading={costDistributionsLoading} />;

  return (
    <>
      {!!createCostDistribution && (
        <CreateCostDistributionModal
          openModal={createCostDistribution}
          closeModal={() => setCreateCostDistribution(false)}
          reloadList={handleReloadList}
          cost_id={cost.id}
        />
      )}

      {!!updateCostDistribution && (
        <UpdateCostDistributionModal
          openModal={!!updateCostDistribution}
          closeModal={() => setUpdateCostDistribution(null)}
          reloadList={handleReloadList}
          cost_distribution_id={updateCostDistribution.id}
        />
      )}

      {!!infoCostDistribution && (
        <InfoCostDistributionModal
          openModal={!!infoCostDistribution}
          closeModal={() => setInfoCostDistribution(null)}
          cost_distribution_id={infoCostDistribution.id}
        />
      )}

      {!!deleteCostDistribution && (
        <DeleteCostDistributionModal
          openModal={!!deleteCostDistribution}
          closeModal={() => setDeleteCostDistribution(null)}
          reloadList={handleReloadList}
          costDistribution={deleteCostDistribution}
        />
      )}

      {costDistributionsData && (
        <CustomDialog
          open={openModal}
          closeModal={() => closeModal(reloadTasks)}
          title={`Distribuições do Custo - ${cost.name}`}
          maxWidth="md"
          customActions={
            <>
              {permissions.createCostDistribution && (
                <CustomIconButton
                  action={() => setCreateCostDistribution(true)}
                  title="Cadastrar Distribuição do Custo"
                  iconType="add"
                />
              )}
            </>
          }
        >
          <Box>
            {costDistributionsInfo.map((costDistribution) => (
              <CostDistributionCard
                key={costDistribution.id}
                sx={{ display: { xs: 'block', sm: 'flex' } }}
              >
                <Grid container spacing={0}>
                  <Grid item xs={7}>
                    <GridBox flexDirection="column" justifyContent="center">
                      <CustomTooltip
                        title={
                          <>
                            <Box>
                              {Object.values(costDistribution.path)
                                .reverse()
                                .map(({ id, name, entity }) => (
                                  <Box key={id} sx={{ display: 'flex' }}>
                                    <Typography
                                      sx={(theme) => ({
                                        color: theme.palette.primary.main,
                                        fontSize: '0.85rem',
                                      })}
                                    >
                                      {entity}:
                                    </Typography>

                                    <Typography sx={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                                      {name}
                                    </Typography>
                                  </Box>
                                ))}
                            </Box>
                          </>
                        }
                      >
                        {costDistribution.path.product.name}
                      </CustomTooltip>

                      <LabelValue label="Serviço:" value={costDistribution.taskType?.name} />
                    </GridBox>
                  </Grid>

                  <Grid item xs={3}>
                    <GridBox flexDirection="column" justifyContent="center">
                      <LabelValue label="Porcentagem:" value={costDistribution.percent} />

                      <LabelValue
                        marginTop="0px !important"
                        label="Valor:"
                        value={costDistribution.value}
                      />
                    </GridBox>
                  </Grid>

                  <Grid item xs={2}>
                    <GridBox alignItems="center" justifyContent="center">
                      <CustomIconButton
                        iconType="info"
                        iconSize="small"
                        title="Informações"
                        action={() => setInfoCostDistribution({ id: costDistribution.id })}
                      />

                      {permissions.updateCostDistribution && (
                        <CustomIconButton
                          iconType="edit"
                          iconSize="small"
                          title="Editar Atribuição"
                          action={() => setUpdateCostDistribution({ id: costDistribution.id })}
                        />
                      )}

                      {permissions.deleteCostDistribution && (
                        <CustomIconButton
                          iconType="delete"
                          iconSize="small"
                          title="Deletar Atribuição"
                          action={() =>
                            setDeleteCostDistribution({
                              id: costDistribution.id,
                              name: `${cost.name} - ${costDistribution.path.product.name} (${costDistribution.percent})`,
                            })
                          }
                        />
                      )}
                    </GridBox>
                  </Grid>
                </Grid>
              </CostDistributionCard>
            ))}

            <Description>
              <Typography whiteSpace="pre-wrap">{cost.description}</Typography>
            </Description>
          </Box>
        </CustomDialog>
      )}
    </>
  );
}
