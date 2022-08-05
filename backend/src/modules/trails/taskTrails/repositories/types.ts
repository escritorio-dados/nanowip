import { TagsGroup } from '@modules/tags/tagsGroups/entities/TagsGroup';
import { TaskType } from '@modules/tasks/taskTypes/entities/TaskType';
import { Trail } from '@modules/trails/trails/entities/Trail';

import { TaskTrail } from '../entities/TaskTrail';

export type ICreateTaskTrailRepository = {
  name: string;
  taskType: TaskType;
  previousTasks: TaskTrail[];
  nextTasks: TaskTrail[];
  trail: Trail;
  organization_id: string;
  tagsGroup?: TagsGroup;
};
