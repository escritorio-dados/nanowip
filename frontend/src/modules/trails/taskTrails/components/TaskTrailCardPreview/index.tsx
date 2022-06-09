import { Tooltip } from '@mui/material';
import { Position } from 'react-flow-renderer';

import { TextEllipsis } from '#shared/styledComponents/common';

import { ITaskTrail } from '#modules/trails/taskTrails/types/ITaskTrail';

import { CustomHandle, TaskContainer } from './styles';

export type ITaskTrailCardPreviewInfo = ITaskTrail & { height: number; width: number };

type ITaskTrailPreviewCard = { data: ITaskTrailCardPreviewInfo };

export function TaskTrailPreviewCard({ data }: ITaskTrailPreviewCard) {
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
      </TaskContainer>

      <CustomHandle type="source" position={Position.Right} />
    </>
  );
}
