import { TaskType } from '@modules/taskTypes/entities/TaskType';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

import { Task } from '../entities/Task';

export type ICreateTaskRepositoryDto = {
  name: string;
  description?: string;
  link?: string;
  taskType: TaskType;
  previousTasks: Task[];
  nextTasks: Task[];
  valueChain: ValueChain;
  deadline?: Date;
  startDate?: Date;
  endDate?: Date;
  availableDate?: Date;
  organization_id: string;
};
