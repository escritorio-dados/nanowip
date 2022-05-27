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
      relations: ['cost', 'cost.costsDistributions'],
      organization_id,
    });

    await this.costDistributionsRepository.delete(costDistribution);

    // Arrumando possiveis alterações das datas fixas
    const { cost } = costDistribution;

    const costTotalPercent = cost.costsDistributions.reduce((total, cd) => {
      total += cd.percent;
      return total;
    }, 0);

    cost.percentDistributed = costTotalPercent - costDistribution.percent;

    await this.costsRepository.save(cost);
  }
}
