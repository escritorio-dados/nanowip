import { Injectable } from '@nestjs/common';

import { getParentPath } from '@shared/utils/getParentPath';

import { FindByCostCostDistributionQuery } from '../query/FindByCost.costDistribution.query';
import { CostDistributionsRepository } from '../repositories/costDistributions.repository';

type IFindAllByCost = FindByCostCostDistributionQuery & { organization_id: string };

@Injectable()
export class FindAllCostDistributionService {
  constructor(private costDistributionsRepository: CostDistributionsRepository) {}

  async findAllByCost({ organization_id, cost_id }: IFindAllByCost) {
    const costDistributions = await this.costDistributionsRepository.findAllByCostInfo({
      cost_id,
      organization_id,
    });

    const costDistributionsFormatted = costDistributions.map(costDistribution => {
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
    });

    return costDistributionsFormatted;
  }
}
