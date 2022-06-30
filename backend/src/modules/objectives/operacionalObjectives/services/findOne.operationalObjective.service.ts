import { Injectable } from '@nestjs/common';

import { CommonOperationalObjectiveService } from './common.operationalObjective.service';

type IFindOneOperationalObjectiveService = { id: string; organization_id: string };

@Injectable()
export class FindOneOperationalObjectiveService {
  constructor(private commonOperationalObjectiveService: CommonOperationalObjectiveService) {}

  async execute({ id, organization_id }: IFindOneOperationalObjectiveService) {
    return this.commonOperationalObjectiveService.getOperationalObjective({
      id,
      organization_id,
      relations: ['integratedObjective'],
    });
  }
}
