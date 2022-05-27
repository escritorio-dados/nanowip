import { Injectable } from '@nestjs/common';

import { getStatusCost } from '../utils/getStatusCost';
import { CommonCostService } from './common.cost.service';

type IFindOneCostService = { id: string; organization_id: string; relations?: string[] };

@Injectable()
export class FindOneCostService {
  constructor(private commonCostService: CommonCostService) {}

  async getInfo({ id, organization_id }: IFindOneCostService) {
    const cost = await this.commonCostService.getCost({
      id,
      organization_id,
      relations: ['documentType', 'serviceProvider'],
    });

    const costFormatted = {
      ...cost,
      status: getStatusCost(cost),
    };

    return costFormatted;
  }

  async execute({ id, organization_id, relations }: IFindOneCostService) {
    const cost = await this.commonCostService.getCost({ id, organization_id, relations });

    return cost;
  }
}
