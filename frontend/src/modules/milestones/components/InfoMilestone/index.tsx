import { Edit } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IMilestone } from '../../types/IMilestone';
import { DeleteMilestoneModal } from '../DeleteMilestone';
import { UpdateMilestone } from '../UpdateMilestone';

type IInfoMilestoneModal = IBaseModal & { milestone_id: string; reloadList: () => void };

export function InfoMilestoneModal({
  closeModal,
  milestone_id,
  openModal,
  reloadList,
}: IInfoMilestoneModal) {
  const [reloadOnClose, setReloadOnClose] = useState(false);

  const [updateMilestone, setUpdateMilestone] = useState(false);
  const [deleteMilestone, setDeleteMilestone] = useState(false);

  const { toast } = useToast();

  const {
    loading: milestoneLoading,
    data: milestoneData,
    error: milestoneError,
    send: getMilestone,
  } = useGet<IMilestone>({ url: `/milestones/${milestone_id}` });

  useEffect(() => {
    if (milestoneError) {
      toast({ message: milestoneError, severity: 'error' });

      closeModal();
    }
  }, [milestoneError, toast, closeModal]);

  const closeModalReload = useCallback(() => {
    if (reloadOnClose) {
      reloadList();
    }

    closeModal();
  }, [closeModal, reloadList, reloadOnClose]);

  const milestoneInfo = useMemo(() => {
    if (!milestoneData) {
      return null;
    }

    return {
      ...milestoneData,
      date: parseDateApi(milestoneData.date, 'dd/MM/yyyy (eeee)', '-'),
      created_at: parseDateApi(milestoneData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(milestoneData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [milestoneData]);

  if (milestoneLoading) return <Loading loading={milestoneLoading} />;

  return (
    <>
      {updateMilestone && milestoneData && (
        <UpdateMilestone
          openModal={updateMilestone}
          closeModal={() => setUpdateMilestone(false)}
          milestone={milestoneData}
          reloadList={() => {
            getMilestone();

            setReloadOnClose(true);
          }}
        />
      )}

      {deleteMilestone && (
        <DeleteMilestoneModal
          openModal={deleteMilestone}
          closeModal={() => setDeleteMilestone(false)}
          milestone={milestoneData}
          reloadList={() => {
            reloadList();

            closeModal();
          }}
        />
      )}

      {milestoneInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModalReload}
          title="Informações do Milestone"
          maxWidth="sm"
          customActions={
            <>
              <CustomIconButton
                iconType="custom"
                title="Editar Milestone"
                action={() => setUpdateMilestone(true)}
                CustomIcon={<Edit fontSize="small" sx={{ color: 'text' }} />}
              />

              <CustomIconButton
                iconType="delete"
                iconSize="small"
                title="Deletar Milestone"
                action={() => setDeleteMilestone(true)}
              />
            </>
          }
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LabelValue label="Nome:" value={milestoneInfo.name} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Data:" value={milestoneInfo.date} />
            </Grid>

            <Grid item xs={12}>
              <LabelValue
                display="block"
                label="Descrição:"
                value={
                  <Typography whiteSpace="pre-wrap" marginLeft="2rem">
                    {milestoneInfo.description}
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={milestoneInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={milestoneInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
