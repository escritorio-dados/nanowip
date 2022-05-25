import { Injectable } from '@nestjs/common';

import { CommonTaskReportCommentService } from './common.taskReportComment.service';

type IFindOneTaskReportCommentService = { id: string; organization_id: string };

@Injectable()
export class FindOneTaskReportCommentService {
  constructor(private commonTaskReportCommentService: CommonTaskReportCommentService) {}

  async execute({ id, organization_id }: IFindOneTaskReportCommentService) {
    return this.commonTaskReportCommentService.getTaskReportComment({ id, organization_id });
  }
}
