import { TaskType } from '@modules/tasks/taskTypes/entities/TaskType';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

import { Task } from '../entities/Task';

export type ICreateTaskRepository = {
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
