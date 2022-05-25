import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { taskReportCommentErrors } from '../errors/taskReportComment.errors';
import { TaskReportCommentsRepository } from '../repositories/taskReportComments.repository';

type IGetTaskReportComment = { id: string; organization_id: string; relations?: string[] };

@Injectable()
export class CommonTaskReportCommentService {
  constructor(private taskReportCommentsRepository: TaskReportCommentsRepository) {}

  async getTaskReportComment({ id, organization_id, relations }: IGetTaskReportComment) {
    const taskReportComment = await this.taskReportCommentsRepository.findById(id, relations);

    if (!taskReportComment) {
      throw new AppError(taskReportCommentErrors.notFound);
    }

    validateOrganization({ entity: taskReportComment, organization_id });

    return taskReportComment;
  }
}
