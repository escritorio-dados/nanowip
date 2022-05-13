import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Cost } from '../entities/Cost';
import { costErrors } from '../errors/cost.errors';
import { CostsRepository } from '../repositories/costs.repository';

type IGetCost = { id: string; relations?: string[]; organization_id: string };

type IValidateCost = { cost: Cost; organization_id: string };

@Injectable()
export class CommonCostService {
  constructor(private costsRepository: CostsRepository) {}

  validateCost({ cost, organization_id }: IValidateCost) {
    if (!cost) {
      throw new AppError(costErrors.notFound);
    }

    validateOrganization({ entity: cost, organization_id });
  }

  async getCost({ id, organization_id, relations }: IGetCost) {
    const cost = await this.costsRepository.findById({ id, relations });

    this.validateCost({ cost, organization_id });

    return cost;
  }
}
