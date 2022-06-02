import { Injectable } from '@nestjs/common';

import { CommonMeasureService } from './common.measure.service';

type IFindOneMeasureService = { id: string; organization_id: string };

@Injectable()
export class FindOneMeasureService {
  constructor(private commonMeasureService: CommonMeasureService) {}

  async execute({ id, organization_id }: IFindOneMeasureService) {
    return this.commonMeasureService.getMeasure({ id, organization_id });
  }
}
