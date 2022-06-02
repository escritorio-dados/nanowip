import { Injectable } from '@nestjs/common';

import { CommonTaskTrailService } from './common.taskTrail.service';

type IFindOneTaskTrailService = { id: string; organization_id: string };

@Injectable()
export class FindOneTaskTrailService {
  constructor(private commonTaskTrailService: CommonTaskTrailService) {}

  async execute({ id, organization_id }: IFindOneTaskTrailService) {
    const taskTrail = await this.commonTaskTrailService.getTaskTrail({
      id,
      organization_id,
      relations: ['nextTasks', 'previousTasks', 'taskType', 'trail'],
    });

    return taskTrail;
  }
}
