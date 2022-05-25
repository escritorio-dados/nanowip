import { TaskType } from '@modules/tasks/taskTypes/entities/TaskType';
import { Trail } from '@modules/trails/entities/Trail';

import { TaskTrail } from '../entities/TaskTrail';

export type ICreateTaskTrailRepositoryDto = {
  name: string;
  taskType: TaskType;
  previousTasks: TaskTrail[];
  nextTasks: TaskTrail[];
  trail: Trail;
  organization_id: string;
};
