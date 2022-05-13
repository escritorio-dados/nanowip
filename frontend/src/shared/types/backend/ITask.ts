import { IStatusDate } from '../IStatusDate';
import { IAssignment } from './IAssignment';
import { ITaskType } from './ITaskType';
import { IValueChain } from './IValueChain';
import { ICommonApi } from './shared/ICommonApi';
import { IDatesApi } from './shared/IDatesApi';

export type ITask = ICommonApi &
  IDatesApi & {
    name: string;
    description?: string;
    link?: string;
    statusDate: IStatusDate;
    nextTasks: ITask[];
    previousTasks: ITask[];
    taskType: ITaskType;
    value_chain_id: string;
    valueChain: IValueChain;
    assignments: IAssignment[];
    assignmentsQtd?: number;
  };

export type ITaskInput = {
  name: string;
  task_type_id: string;
  description?: string;
  link?: string;
  value_chain_id?: string;

  previous_tasks_ids?: string[];
  next_tasks_ids?: string[];

  deadline?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  availableDate?: Date | null;
};

export const limitedTaskLength = 100;

export type IEdge = { source: string; target: string; id: string };

export type ITaskNode = {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  data: ITask;
};

export type IGraphTasks = {
  nodes: ITaskNode[];
  edges: IEdge[];
};
