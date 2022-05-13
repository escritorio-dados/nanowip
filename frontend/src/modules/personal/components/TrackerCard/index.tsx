import { AccessTimeFilled, CalendarMonth, Check, Flag, PlayArrow, Stop } from '@mui/icons-material';
import { Box, Tooltip, Typography } from '@mui/material';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { StopWatch } from '#shared/components/StopWatch';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IPathObject } from '#shared/types/backend/shared/ICommonApi';

import { AssignmentCard, AssignmentCardInfo } from './styles';

export type ITrackerCardData = {
  id: string;
  pathString: string;
  path: IPathObject;
  deadline: string;
  durationText: string;
  durationLimitText?: string;
  timeLimitText?: string;
  description?: string;
  link?: string;
  duration: number;
  assignment_id?: string;
  reason?: string;
};

type ITrackerCard = {
  data: ITrackerCardData;
  iconType: 'stop' | 'start';
  activeTimer?: boolean;
  handleStartTracker: (assignment_id: string) => void;
  handleStopTracker: () => void;
  handleEndTask: (assignment_id: string, path: IPathObject) => void;
  handleShowDescription: (dados: { description?: string; link?: string }) => void;
};

export function TrackerCard({
  data,
  iconType,
  handleStartTracker,
  handleStopTracker,
  handleEndTask,
  handleShowDescription,
  activeTimer,
}: ITrackerCard) {
  return (
    <AssignmentCard>
      <header>
        <Box maxWidth="85%">
          <Tooltip
            componentsProps={{
              tooltip: {
                sx: (theme) => ({
                  backgroundColor: theme.palette.background.default,
                  border: `2px solid ${theme.palette.divider}`,
                }),
              },
            }}
            title={
              data.reason ? (
                data.reason
              ) : (
                <Box>
                  {Object.values(data.path)
                    .reverse()
                    .map(({ id, name, entity }) => (
                      <Box key={id} sx={{ display: 'flex' }}>
                        <Typography
                          fontSize="0.875rem"
                          sx={(theme) => ({ color: theme.palette.primary.main })}
                        >
                          {entity}:
                        </Typography>

                        <Typography fontSize="0.875rem" sx={{ marginLeft: '0.5rem' }}>
                          {name}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              )
            }
          >
            {data.reason ? (
              <TextEllipsis>{data.reason}</TextEllipsis>
            ) : (
              <Box>
                <TextEllipsis
                  sx={(theme) => ({
                    fontSize: '0.875rem',
                    color: theme.palette.primary.main,
                  })}
                >
                  {data.path.product.name}
                </TextEllipsis>

                <TextEllipsis>{data.path.task.name}</TextEllipsis>
              </Box>
            )}
          </Tooltip>
        </Box>

        <CustomIconButton
          sx={{ padding: '0.5rem' }}
          type="info"
          size="small"
          title="Descrição"
          action={() => handleShowDescription({ description: data.description, link: data.link })}
        />
      </header>

      <AssignmentCardInfo>
        <Box className="info">
          {data.path && (
            <Box className="deadline">
              <CalendarMonth fontSize="small" sx={{ marginRight: '0.5rem' }} />

              <Typography>{data.deadline}</Typography>
            </Box>
          )}

          <Box className="stopwatch">
            <Box className="timer">
              <AccessTimeFilled fontSize="small" sx={{ marginRight: '0.5rem' }} />

              {activeTimer ? (
                <StopWatch initialDuration={data.duration} />
              ) : (
                <Typography>{data.durationText}</Typography>
              )}
            </Box>

            {data.durationLimitText && (
              <Box className="limit">
                <Typography> / {data.durationLimitText}</Typography>

                <Flag
                  fontSize="small"
                  sx={(theme) => ({ marginLeft: '0.5rem', color: theme.palette.success.main })}
                />
              </Box>
            )}
          </Box>
        </Box>

        <Box className="actions">
          {iconType === 'start' ? (
            <CustomIconButton
              type="custom"
              title="Iniciar"
              CustomIcon={<PlayArrow color="success" fontSize="medium" />}
              action={() => handleStartTracker(data.id)}
            />
          ) : (
            <CustomIconButton
              type="custom"
              title="Pausar"
              CustomIcon={<Stop color="error" fontSize="medium" />}
              action={handleStopTracker}
            />
          )}

          {data.path && (
            <CustomIconButton
              type="custom"
              title="Concluir"
              CustomIcon={<Check color="primary" fontSize="medium" />}
              action={() => handleEndTask(data.assignment_id || data.id, data.path)}
            />
          )}
        </Box>
      </AssignmentCardInfo>
    </AssignmentCard>
  );
}
