import { ICommonApi } from '#shared/types/ICommonApi';
import { IDatesApi } from '#shared/types/IDatesApi';
import { IStatusDate } from '#shared/types/IStatusDate';

import { IAssignment } from '#modules/assignments/types/IAssignment';
import { ITaskReportComment } from '#modules/tasks/taskReportComments/types/ITaskReportComment';
import { ITaskType } from '#modules/tasks/taskTypes/types/ITaskType';
import { IValueChain } from '#modules/valueChains/types/IValueChain';

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
    hasComments: boolean;
    commentsReport: ITaskReportComment[];
    tagsGroup: {
      id: string;
      tags: Array<{
        id: string;
        name: string;
      }>;
    };
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

  tags?: string[];
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
