import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { CostDistribution } from '../entities/CostDistribution';
import { costDistributionErrors } from '../errors/costDistribution.errors';
import { CostDistributionsRepository } from '../repositories/costDistributions.repository';

type IGetCostDistribution = { id: string; organization_id: string; relations?: string[] };
type IValidateCostDistribution = { costDistribution: CostDistribution; organization_id: string };

@Injectable()
export class CommonCostDistributionService {
  constructor(private costDistributionsRepository: CostDistributionsRepository) {}

  async getCostDistribution({ id, organization_id, relations }: IGetCostDistribution) {
    const costDistribution = await this.costDistributionsRepository.findById(id, relations);

    this.validateCostDistribution({ costDistribution, organization_id });

    return costDistribution;
  }

  validateCostDistribution({ costDistribution, organization_id }: IValidateCostDistribution) {
    if (!costDistribution) {
      throw new AppError(costDistributionErrors.notFound);
    }

    validateOrganization({ entity: costDistribution, organization_id });
  }
}
