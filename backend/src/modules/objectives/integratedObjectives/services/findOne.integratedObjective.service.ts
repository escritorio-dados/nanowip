import { Injectable } from '@nestjs/common';

import { CommonIntegratedObjectiveService } from './common.integratedObjective.service';

type IFindOneIntegratedObjectiveService = { id: string; organization_id: string };

@Injectable()
export class FindOneIntegratedObjectiveService {
  constructor(private commonIntegratedObjectiveService: CommonIntegratedObjectiveService) {}

  async execute({ id, organization_id }: IFindOneIntegratedObjectiveService) {
    return this.commonIntegratedObjectiveService.getIntegratedObjective({ id, organization_id });
  }
}
