import { ICommonApi } from '#shared/types/ICommonApi';

export type ITaskReportComment = ICommonApi & {
  reportName: string;
  task_id: string;
  comment: string;
};

export type ICreateTaskReportCommentInput = {
  reportName: string;
  task_id: string;
  comment: string;
};

export type IUpdateTaskReportCommentInput = {
  comment: string;
};

export const reportNames = {
  fluxos: 'tabela_fluxos',
};
