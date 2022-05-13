import { Tooltip } from '@mui/material';
import { Position } from 'react-flow-renderer';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { TextEllipsis } from '#shared/styledComponents/common';
import { ITaskTrail } from '#shared/types/backend/ITaskTrail';

import { CustomHandle, TaskCardActions, TaskContainer } from './styles';

type permissionsFields = 'updateTask' | 'deleteTask';

export type ITaskTrailCardInfo = ITaskTrail & {
  height: number;
  width: number;
  permissions: { [key in permissionsFields]: boolean };
  setInfo: (id: string) => void;
  setUpdate: (id: string) => void;
  setDelete: (id: string, name: string) => void;
};

type ITaskTrailCard = { data: ITaskTrailCardInfo };

export function TaskTrailCard({ data }: ITaskTrailCard) {
  return (
    <>
      <CustomHandle type="target" position={Position.Left} />

      <TaskContainer
        sx={{
          width: data.width - 30,
          height: data.height - 30,
        }}
      >
        <header className="custom-drag-handle">
          <Tooltip title={data.name}>
            <TextEllipsis>{data.name}</TextEllipsis>
          </Tooltip>
        </header>

        <TaskCardActions>
          <CustomIconButton
            type="info"
            size="small"
            title="Informações"
            action={() => data.setInfo(data.id)}
          />

          {data.permissions.updateTask && (
            <CustomIconButton
              type="edit"
              size="small"
              title="Editar Tarefa"
              action={() => data.setUpdate(data.id)}
            />
          )}

          {data.permissions.deleteTask && (
            <CustomIconButton
              type="delete"
              size="small"
              title="Deletar Tarefa"
              action={() => data.setDelete(data.id, data.name)}
            />
          )}
        </TaskCardActions>
      </TaskContainer>

      <CustomHandle type="source" position={Position.Right} />
    </>
  );
}
