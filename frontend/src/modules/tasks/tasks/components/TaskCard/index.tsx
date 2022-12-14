import { AssignmentInd } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import { Position } from 'react-flow-renderer';
import { useNavigate } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { useKeepStates } from '#shared/hooks/keepStates';
import { TextEllipsis } from '#shared/styledComponents/common';

import { ITask } from '#modules/tasks/tasks/types/ITask';

import {
  CustomHandle,
  TaskCardActions,
  TaskContainer,
  ValueChainText,
  AssignmentsNumber,
} from './styles';

type permissionsFields = 'updateTask' | 'deleteTask' | 'readAssignment';

export type ITaskCardInfo = ITask & {
  lateColor?: string;
  statusColor: string;
  status: string;
  height: number;
  width: number;
  permissions: { [key in permissionsFields]: boolean };
  setInfo: (id: string) => void;
  setUpdate: (id: string) => void;
  setDelete: (id: string, name: string) => void;
  setAssignments: (id: string, name: string) => void;
  valueChainId: string;
};

type ITaskCard = { data: ITaskCardInfo };

export function TaskCard({ data }: ITaskCard) {
  const navigate = useNavigate();
  const { updateState } = useKeepStates();

  return (
    <>
      <CustomHandle type="target" position={Position.Left} />

      <TaskContainer
        sx={{
          borderColor: data.lateColor || data.statusColor,
          width: data.width - 30,
          height: data.height - 30,
        }}
      >
        <header className="custom-drag-handle">
          <CustomTooltip title={data.status}>
            <Box className="status">
              {data.lateColor && <Box className="late" sx={{ background: data.lateColor }} />}

              <Box sx={{ background: data.statusColor }} />
            </Box>
          </CustomTooltip>

          <Tooltip title={data.name}>
            <TextEllipsis>{data.name}</TextEllipsis>
          </Tooltip>
        </header>

        {data.value_chain_id ? (
          <ValueChainText>
            <Tooltip title={data.pathString}>
              <Button onClick={() => navigate(`/tasks/graph/${data.value_chain_id}`)}>
                {data.pathString}
              </Button>
            </Tooltip>
          </ValueChainText>
        ) : (
          <TaskCardActions>
            {data.permissions.readAssignment && (
              <AssignmentsNumber badgeContent={data.assignmentsQtd || 0} color="primary">
                <CustomIconButton
                  iconType="custom"
                  iconSize="small"
                  title="Atribui????es"
                  CustomIcon={<AssignmentInd fontSize="small" sx={{ color: 'success.main' }} />}
                  action={() => {
                    data.setAssignments(data.id, data.name);

                    updateState({
                      category: '[A]Modal',
                      key: data.valueChainId,
                      value: { id: data.id, name: data.name },
                    });
                  }}
                />
              </AssignmentsNumber>
            )}

            <CustomIconButton
              iconType="info"
              iconSize="small"
              title="Informa????es"
              action={() => data.setInfo(data.id)}
            />

            {data.permissions.updateTask && (
              <CustomIconButton
                iconType="edit"
                iconSize="small"
                title="Editar Tarefa"
                action={() => data.setUpdate(data.id)}
              />
            )}

            {data.permissions.deleteTask && (
              <CustomIconButton
                iconType="delete"
                iconSize="small"
                title="Deletar Tarefa"
                action={() => data.setDelete(data.id, data.name)}
              />
            )}
          </TaskCardActions>
        )}
      </TaskContainer>

      <CustomHandle type="source" position={Position.Right} />
    </>
  );
}
