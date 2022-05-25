import { Injectable } from '@nestjs/common';

import { FindOneTaskService } from '@modules/tasks/tasks/services/findOne.task.service';

import { CreateTaskReportCommentDto } from '../dtos/create.taskReportComment.dto';
import { TaskReportCommentsRepository } from '../repositories/taskReportComments.repository';

type ICreateTaskReportCommentService = CreateTaskReportCommentDto & { organization_id: string };

@Injectable()
export class CreateTaskReportCommentService {
  constructor(
    private taskReportCommentsRepository: TaskReportCommentsRepository,

    private findOneTaskService: FindOneTaskService,
  ) {}

  async execute({
    comment,
    reportName,
    task_id,
    organization_id,
  }: ICreateTaskReportCommentService) {
    const task = await this.findOneTaskService.execute({ id: task_id, organization_id });

    const taskReportComment = await this.taskReportCommentsRepository.create({
      reportName,
      comment,
      task,
      organization_id,
    });

    return taskReportComment;
  }
}
