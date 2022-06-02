import { Injectable } from '@nestjs/common';

import { CommonTrailService } from './common.trail.service';

type IFindOneTrailService = { id: string; organization_id: string };

@Injectable()
export class FindOneTrailService {
  constructor(private commonTrailService: CommonTrailService) {}

  async execute({ id, organization_id }: IFindOneTrailService) {
    return this.commonTrailService.getTrail({ id, organization_id });
  }
}
