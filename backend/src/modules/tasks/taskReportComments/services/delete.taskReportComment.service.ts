import { Injectable } from '@nestjs/common';

import { TaskReportCommentsRepository } from '../repositories/taskReportComments.repository';
import { CommonTaskReportCommentService } from './common.taskReportComment.service';

type IDeleteTaskReportCommentService = { id: string; organization_id: string };

@Injectable()
export class DeleteTaskReportCommentService {
  constructor(
    private taskReportCommentsRepository: TaskReportCommentsRepository,
    private commonTaskReportCommentService: CommonTaskReportCommentService,
  ) {}

  async execute({ id, organization_id }: IDeleteTaskReportCommentService) {
    const taskReportComment = await this.commonTaskReportCommentService.getTaskReportComment({
      id,
      organization_id,
    });

    await this.taskReportCommentsRepository.delete(taskReportComment);
  }
}
