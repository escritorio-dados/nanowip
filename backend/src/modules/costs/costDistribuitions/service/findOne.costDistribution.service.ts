import { Injectable } from '@nestjs/common';

import { getParentPath } from '@shared/utils/getParentPath';

import { CostDistributionsRepository } from '../repositories/costDistributions.repository';
import { CommonCostDistributionService } from './common.costDistribution.service';

type IFindOneCostDistributionService = { id: string; organization_id: string };

@Injectable()
export class FindOneCostDistributionService {
  constructor(
    private commonCostDistributionService: CommonCostDistributionService,
    private costDistributionsRepository: CostDistributionsRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneCostDistributionService) {
    const costDistribution = await this.costDistributionsRepository.getInfo(id);

    this.commonCostDistributionService.validateCostDistribution({
      costDistribution,
      organization_id,
    });

    return {
      ...costDistribution,
      path: getParentPath({
        entity: costDistribution.product,
        entityType: 'product',
        getCustomer: true,
        includeEntity: true,
      }),
      product: undefined,
      value: costDistribution.cost.value * costDistribution.percent,
    };
  }

  async execute({ id, organization_id }: IFindOneCostDistributionService) {
    const costDistribution = await this.commonCostDistributionService.getCostDistribution({
      id,
      organization_id,
    });

    return costDistribution;
  }
}
