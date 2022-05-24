import { Box, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICostDistribution } from '#shared/types/backend/costs/ICostDistribution';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { CreateCostDistributionModal } from '../CreateCostDistribution';
import { DeleteCostDistributionModal } from '../DeleteCostDistribution';
import { InfoCostDistributionModal } from '../InfoCostDistribution';
import { UpdateCostDistributionModal } from '../UpdateCostDistribution';
import { CostDistributionCard, FieldValueContainer, GridBox } from './styles';

type IInfoCostDistributionsTaskModal = {
  openModal: boolean;
  closeModal: (reload: boolean) => void;
  cost: { id: string; name: string };
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
      const percent = `${Math.round((costDistribution.percent || 0) * 100)}%`;

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
                  type="add"
                />
              )}
            </>
          }
        >
          {costDistributionsInfo.map((costDistribution) => (
            <CostDistributionCard
              key={costDistribution.id}
              sx={{ display: { xs: 'block', sm: 'flex' } }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
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
                      children={costDistribution.path.product.name}
                    />

                    <FieldValueContainer>
                      <Typography component="strong">Serviço: </Typography>

                      <Typography>{costDistribution.service?.name}</Typography>
                    </FieldValueContainer>
                  </GridBox>
                </Grid>

                <Grid item xs={3}>
                  <GridBox flexDirection="column" justifyContent="center">
                    <FieldValueContainer>
                      <Typography component="strong">Porcentagem: </Typography>

                      <Typography>{costDistribution.percent}</Typography>
                    </FieldValueContainer>

                    <FieldValueContainer>
                      <Typography component="strong">Valor: </Typography>

                      <Typography>{costDistribution.value}</Typography>
                    </FieldValueContainer>
                  </GridBox>
                </Grid>

                <Grid item xs={3}>
                  <GridBox alignItems="center">
                    <CustomIconButton
                      type="info"
                      size="small"
                      title="Informações"
                      action={() => setInfoCostDistribution({ id: costDistribution.id })}
                    />

                    {permissions.updateCostDistribution && (
                      <CustomIconButton
                        type="edit"
                        size="small"
                        title="Editar Atribuição"
                        action={() => setUpdateCostDistribution({ id: costDistribution.id })}
                      />
                    )}

                    {permissions.deleteCostDistribution && (
                      <CustomIconButton
                        type="delete"
                        size="small"
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

              {/* <div className="title" />

              <div className="values" />

              <div className="actions">
                <CustomIconButton
                  type="info"
                  size="small"
                  title="Informações"
                  action={() => setInfoCostDistribution({ id: costDistribution.id })}
                />

                {permissions.updateCostDistribution && (
                  <CustomIconButton
                    type="edit"
                    size="small"
                    title="Editar Atribuição"
                    action={() => setUpdateCostDistribution({ id: costDistribution.id })}
                  />
                )}

                {permissions.deleteCostDistribution && (
                  <CustomIconButton
                    type="delete"
                    size="small"
                    title="Deletar Atribuição"
                    action={() =>
                      setDeleteCostDistribution({
                        id: costDistribution.id,
                        name: `${cost.name} - ${costDistribution.path.product.name} (${costDistribution.percent})`,
                      })
                    }
                  />
                )}
              </div> */}
            </CostDistributionCard>
          ))}
        </CustomDialog>
      )}
    </>
  );
}
