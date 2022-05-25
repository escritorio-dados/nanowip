import { Injectable } from '@nestjs/common';

import { FindAllByTaskReportLimitedTaskReportCommentQuery } from '../query/findAllByTaskReport.taskReportComment.query';
import { TaskReportCommentsRepository } from '../repositories/taskReportComments.repository';

type IFindAllTaskReportCommentService = {
  query: FindAllByTaskReportLimitedTaskReportCommentQuery;
  organization_id: string;
};

@Injectable()
export class FindAllTaskReportCommentService {
  constructor(private taskReportCommentsRepository: TaskReportCommentsRepository) {}

  async findbyTaskReport({ organization_id, query }: IFindAllTaskReportCommentService) {
    const taskReportComments = await this.taskReportCommentsRepository.findAllByTaskReport({
      organization_id,
      task_id: query.task_id,
      reportName: query.report_name,
    });

    return taskReportComments;
  }
}
