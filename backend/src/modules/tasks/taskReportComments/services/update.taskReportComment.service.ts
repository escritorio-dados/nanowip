import { Injectable } from '@nestjs/common';

import { UpdateTaskReportCommentDto } from '../dtos/update.taskReportComment.dto';
import { TaskReportCommentsRepository } from '../repositories/taskReportComments.repository';
import { CommonTaskReportCommentService } from './common.taskReportComment.service';

type IUpdateTaskReportCommentService = UpdateTaskReportCommentDto & {
  id: string;
  organization_id: string;
};

@Injectable()
export class UpdateTaskReportCommentService {
  constructor(
    private taskReportCommentsRepository: TaskReportCommentsRepository,
    private commonTaskReportCommentService: CommonTaskReportCommentService,
  ) {}

  async execute({ id, comment, organization_id }: IUpdateTaskReportCommentService) {
    const taskReportComment = await this.commonTaskReportCommentService.getTaskReportComment({
      id,
      organization_id,
    });

    taskReportComment.comment = comment;

    await this.taskReportCommentsRepository.save(taskReportComment);

    return taskReportComment;
  }
}
