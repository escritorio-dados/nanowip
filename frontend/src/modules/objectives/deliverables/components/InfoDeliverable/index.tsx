import { Box, Grid, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IBaseModal } from '#shared/types/IModal';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IDeliverable } from '../../types/IDeliverable';
import { ProgressBar } from '../DeliverableCard/ProgressBar';

type IInfoDeliverableModal = IBaseModal & { deliverable_id: string };

export function InfoDeliverableModal({
  closeModal,
  deliverable_id,
  openModal,
}: IInfoDeliverableModal) {
  const { toast } = useToast();
  const { checkPermissions } = useAuth();

  const {
    loading: deliverableLoading,
    data: deliverableData,
    error: deliverableError,
  } = useGet<IDeliverable>({ url: `/deliverables/${deliverable_id}` });

  useEffect(() => {
    if (deliverableError) {
      toast({ message: deliverableError, severity: 'error' });

      closeModal();
    }
  }, [deliverableError, toast, closeModal]);

  const deliverableInfo = useMemo(() => {
    if (!deliverableData) {
      return null;
    }

    let progression = '-';

    if (Number.isInteger(deliverableData.progress)) {
      const calcProgress = (deliverableData.progress / deliverableData.goal) * 100;

      progression = `${deliverableData.progress}/${deliverableData.goal} (${calcProgress.toFixed(
        2,
      )}%)`.replace('.', ',');
    }

    let progressionVC = '-';

    if (Number.isInteger(deliverableData.progressValueChains)) {
      const calcProgressVc =
        (deliverableData.progressValueChains / deliverableData.goalValueChains) * 100;

      progressionVC = `${deliverableData.progressValueChains}/${
        deliverableData.goalValueChains
      } (${calcProgressVc.toFixed(2)}%)`.replace('.', ',');
    }

    return {
      ...deliverableData,
      progression,
      progressionVC,
      deadline: parseDateApi(deliverableData.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
      created_at: parseDateApi(deliverableData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(deliverableData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [deliverableData]);

  const permissions = useMemo(() => {
    return {
      goToValueChain: checkPermissions([
        [PermissionsUser.read_task, PermissionsUser.manage_task],
        [PermissionsUser.read_value_chain, PermissionsUser.manage_value_chain],
      ]),
    };
  }, [checkPermissions]);

  if (deliverableLoading) return <Loading loading={deliverableLoading} />;

  return (
    <>
      {deliverableInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Tarefa"
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LabelValue label="Nome:" value={deliverableInfo.name} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Progressão:" value={deliverableInfo.progression} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Prazo:" value={deliverableInfo.deadline} />
            </Grid>

            <Grid item xs={12}>
              <LabelValue
                display="block"
                label="Descrição:"
                value={
                  <Typography whiteSpace="pre-wrap" marginLeft="2rem">
                    {deliverableInfo.description}
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12}>
              <LabelValue
                label="Progressão Cadeias de Valor:"
                value={deliverableInfo.progressionVC}
              />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={1}>
                {deliverableInfo.valueChains.map((vc) => (
                  <Grid item xs={6} sm={6} key={vc.id}>
                    <Box
                      sx={(theme) => ({
                        border: `1px solid ${theme.palette.divider}`,
                        padding: '0.5rem',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                      })}
                    >
                      <CustomTooltip
                        title={
                          <Box>
                            {Object.values(vc.path)
                              .reverse()
                              .map(({ id, name, entity }) => (
                                <Box key={id} sx={{ display: 'flex' }}>
                                  <Typography
                                    sx={(theme) => ({ color: theme.palette.primary.main })}
                                  >
                                    {entity}:
                                  </Typography>

                                  <Typography sx={{ marginLeft: '0.5rem' }}>{name}</Typography>
                                </Box>
                              ))}
                          </Box>
                        }
                      >
                        <Box flex={1} maxWidth="90%">
                          <TextEllipsis
                            sx={(theme) => ({
                              color: theme.palette.primary.main,
                            })}
                            fontSize="0.875rem"
                          >
                            {vc.path.subproduct?.name ? `${vc.path.subproduct?.name} | ` : ''}
                            {vc.path.product.name}
                          </TextEllipsis>

                          <TextEllipsis fontSize="0.875rem">{vc.name}</TextEllipsis>

                          <ProgressBar goal={vc.goal} progress={vc.progress} color={blue[500]} />
                        </Box>
                      </CustomTooltip>

                      {permissions.goToValueChain && (
                        <CustomIconButton
                          sx={{ marginLeft: 'auto' }}
                          title="Info"
                          action={() =>
                            window.open(`${window.location.origin}/tasks/graph/${vc.id}`)
                          }
                          iconType="info"
                          size="small"
                          iconSize="small"
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={deliverableInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={deliverableInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
