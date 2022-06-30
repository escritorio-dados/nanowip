import { Injectable } from '@nestjs/common';

import { CommonSectionTrailService } from './common.sectionTrail.service';

type IFindOneSectionTrailService = { id: string; organization_id: string };

@Injectable()
export class FindOneSectionTrailService {
  constructor(private commonSectionTrailService: CommonSectionTrailService) {}

  async execute({ id, organization_id }: IFindOneSectionTrailService) {
    return this.commonSectionTrailService.getTrail({ id, organization_id });
  }
}
