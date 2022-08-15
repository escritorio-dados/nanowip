import { Add } from '@mui/icons-material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IMilestone } from '#modules/milestones/types/IMilestone';

import { CreateMilestone } from '../CreateMilestone';
import { InfoMilestoneModal } from '../InfoMilestone';
import { MilestoneMainContent, TextEllipsisMultiline } from './styles';

export type IMilestoneModal = {
  id: string;
  name: string;
  createApiRoute: string;
};

type IIdModal = { id: string } | null;

type IListMilestones = IBaseModal & { data: IMilestoneModal };

export function ListMilestones({ closeModal, openModal, data }: IListMilestones) {
  const [createMilestone, setCreateMilestone] = useState(false);
  const [infoMilestone, setInfoMilestone] = useState<IIdModal>(null);

  const { toast } = useToast();

  const {
    loading: milestonesLoading,
    data: milestonesData,
    error: milestonesError,
    send: getMilestones,
  } = useGet<IMilestone[]>({ url: data.createApiRoute, lazy: true });

  useEffect(() => {
    if (milestonesError) {
      toast({ message: milestonesError, severity: 'error' });
    }
  }, [toast, milestonesError]);

  useEffect(() => {
    if (openModal) {
      getMilestones();
    }
  }, [toast, openModal, getMilestones]);

  const milestonesInfo = useMemo(() => {
    if (!milestonesData) {
      return [];
    }

    return milestonesData.map((milestone, index) => ({
      ...milestone,
      date: parseDateApi(milestone.date, 'dd/MM/yyyy', 'Sem Data'),
      side: index % 2 === 0 ? 'left' : 'right',
    }));
  }, [milestonesData]);

  return (
    <>
      <Loading loading={milestonesLoading} />

      {createMilestone && (
        <CreateMilestone
          openModal={createMilestone}
          closeModal={() => setCreateMilestone(false)}
          apiRoute={data.createApiRoute}
          reloadList={getMilestones}
        />
      )}

      {infoMilestone && (
        <InfoMilestoneModal
          openModal={!!infoMilestone}
          closeModal={() => setInfoMilestone(null)}
          milestone_id={infoMilestone.id}
          reloadList={getMilestones}
        />
      )}

      <CustomDialog open={openModal} closeModal={closeModal} title="Milestones" maxWidth="md">
        <Typography
          sx={{
            marginBottom: '1rem',
            borderBottom: '1px solid #eee',
            paddingBottom: '1rem',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {data.name}
        </Typography>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          marginBottom="0.5rem"
        >
          <Button
            startIcon={<Add />}
            color="inherit"
            sx={(theme) => ({ textTransform: 'none', color: theme.palette.text.primary })}
            onClick={() => setCreateMilestone(true)}
          >
            Adicionar Milestone
          </Button>
        </Box>

        <Timeline>
          {milestonesInfo.map((milestone, index) => (
            <TimelineItem key={milestone.id} sx={{ mb: '0.5rem' }}>
              {milestone.side === 'right' ? (
                <TimelineOppositeContent sx={{ width: '50%' }}>
                  <MilestoneMainContent onClick={() => setInfoMilestone({ id: milestone.id })}>
                    <TextEllipsis sx={{ fontWeight: 'bold' }}>{milestone.name}</TextEllipsis>

                    <TextEllipsisMultiline sx={{ fontSize: '0.8rem' }}>
                      {milestone.description}
                    </TextEllipsisMultiline>
                  </MilestoneMainContent>
                </TimelineOppositeContent>
              ) : (
                <TimelineOppositeContent sx={{ width: '50%' }}>
                  <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>
                    {milestone.date}
                  </Typography>
                </TimelineOppositeContent>
              )}

              <TimelineSeparator>
                <TimelineDot />

                {index !== milestonesInfo.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              {milestone.side === 'left' ? (
                <TimelineContent sx={{ width: '50%' }}>
                  <MilestoneMainContent onClick={() => setInfoMilestone({ id: milestone.id })}>
                    <TextEllipsis sx={{ fontWeight: 'bold' }}>{milestone.name}</TextEllipsis>

                    <TextEllipsisMultiline sx={{ fontSize: '0.8rem' }}>
                      {milestone.description}
                    </TextEllipsisMultiline>
                  </MilestoneMainContent>
                </TimelineContent>
              ) : (
                <TimelineContent sx={{ width: '50%' }}>
                  <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>
                    {milestone.date}
                  </Typography>
                </TimelineContent>
              )}
            </TimelineItem>
          ))}
        </Timeline>
      </CustomDialog>
    </>
  );
}
