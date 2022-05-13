import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { costErrors } from '../errors/cost.errors';
import { CostsRepository } from '../repositories/costs.repository';
import { CommonCostService } from './common.cost.service';

type IDeleteCostService = { id: string; organization_id: string };

@Injectable()
export class DeleteCostService {
  constructor(
    private costsRepository: CostsRepository,
    private commonCostService: CommonCostService,
  ) {}

  async execute({ id, organization_id }: IDeleteCostService) {
    const cost = await this.commonCostService.getCost({
      id,
      relations: ['costsDistributions'],
      organization_id,
    });

    if (cost.costsDistributions.length > 0) {
      throw new AppError(costErrors.deleteDistributedCosts);
    }

    await this.costsRepository.delete(cost);
  }
}
