import { Injectable } from '@nestjs/common';

import { CostsRepository } from '@modules/costs/costs/repositories/costs.repository';

import { CostDistributionsRepository } from '../repositories/costDistributions.repository';
import { CommonCostDistributionService } from './common.costDistribution.service';

type IDeleteCostDistributionService = { id: string; organization_id: string };

@Injectable()
export class DeleteCostDistributionService {
  constructor(
    private costDistributionsRepository: CostDistributionsRepository,
    private commonCostDistributionService: CommonCostDistributionService,

    private costsRepository: CostsRepository,
  ) {}

  async execute({ id, organization_id }: IDeleteCostDistributionService) {
    const costDistribution = await this.commonCostDistributionService.getCostDistribution({
      id,
      relations: ['cost'],
      organization_id,
    });

    await this.costDistributionsRepository.delete(costDistribution);

    // Arrumando possiveis alterações das datas fixas
    const { cost } = costDistribution;

    cost.percentDistributed -= costDistribution.percent;

    await this.costsRepository.save(cost);
  }
}
