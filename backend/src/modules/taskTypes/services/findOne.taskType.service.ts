import { Injectable } from '@nestjs/common';

import { CommonTaskTypeService } from './common.taskType.service';

type IFindOneTaskTypeService = { id: string; organization_id: string };

@Injectable()
export class FindOneTaskTypeService {
  constructor(private commonTaskTypeService: CommonTaskTypeService) {}

  async execute({ id, organization_id }: IFindOneTaskTypeService) {
    return this.commonTaskTypeService.getTaskType({ id, organization_id });
  }
}
