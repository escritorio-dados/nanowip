import { ITaskType } from '#modules/tasks/taskTypes/types/ITaskType';
import { ICommonApi } from '#shared/types/backend/shared/ICommonApi';

import { ITrail } from '#modules/trails/trails/types/ITrail';

export type ITaskTrail = ICommonApi & {
  name: string;
  trail_id: string;
  taskType: ITaskType;
  nextTasks: ITaskTrail[];
  previousTasks: ITaskTrail[];
  trail: ITrail;
};

export type ITaskTrailInput = {
  name: string;
  task_type_id: string;
  trail_id?: string;
  previous_tasks_ids?: string[];
  next_tasks_ids?: string[];
};

export const limitedTaskTrailLength = 100;

export type IEdge = { source: string; target: string; id: string };

export type ITaskTrailNode = {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  data: ITaskTrail;
};

export type IGraphTaskTrails = {
  nodes: ITaskTrailNode[];
  edges: IEdge[];
};