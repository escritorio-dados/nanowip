import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { CostsRepository } from '@modules/costs/costs/repositories/costs.repository';
import { FindOneProductService } from '@modules/products/services/findOne.product.service';
import { FindOneTaskTypeService } from '@modules/tasks/taskTypes/services/findOne.taskType.service';

import { UpdateCostDistributionDto } from '../dtos/update.costDistribution.dto';
import { CostDistributionsRepository } from '../repositories/costDistributions.repository';
import { CommonCostDistributionService } from './common.costDistribution.service';

type IUpdateCostDistributionService = UpdateCostDistributionDto & {
  id: string;
  organization_id: string;
};

@Injectable()
export class UpdateCostDistributionService {
  constructor(
    private costDistributionsRepository: CostDistributionsRepository,
    private commonCostDistributionService: CommonCostDistributionService,

    private costsRepository: CostsRepository,
    private findOneProductService: FindOneProductService,
    private findOneTaskTypeService: FindOneTaskTypeService,
  ) {}

  async execute({
    id,
    organization_id,
    percent,
    product_id,
    task_type_id,
  }: IUpdateCostDistributionService) {
    const costDistribution = await this.commonCostDistributionService.getCostDistribution({
      id,
      relations: ['cost', 'cost.costsDistributions'],
      organization_id,
    });

    const { cost } = costDistribution;

    let saveCost = false;

    const fixedPercent = percent / 100;

    const costTotalPercent = cost.costsDistributions.reduce((total, cd) => {
      total += cd.percent;
      return total;
    }, 0);

    if (costTotalPercent !== fixedPercent) {
      const newPercentDistributed = costTotalPercent - costDistribution.percent;

      if (1 - newPercentDistributed < fixedPercent) {
        const allowed = 1 - newPercentDistributed;

        throw new AppError({
          message: `maximum value allowed: ${allowed * 100}%`,
          userMessage: `valor maximo permitido: ${allowed * 100}%`,
        });
      }

      cost.percentDistributed = newPercentDistributed;

      costDistribution.percent = fixedPercent;

      cost.percentDistributed += fixedPercent;

      saveCost = true;
    }

    if (costDistribution.product_id !== product_id) {
      costDistribution.product = await this.findOneProductService.execute({
        id: product_id,
        organization_id,
      });

      costDistribution.product_id = product_id;
    }

    if (costDistribution.task_type_id !== task_type_id) {
      if (task_type_id) {
        costDistribution.taskType = await this.findOneTaskTypeService.execute({
          id: task_type_id,
          organization_id,
        });

        costDistribution.task_type_id = task_type_id;
      } else {
        costDistribution.task_type_id = null;
      }
    }

    await this.costDistributionsRepository.save(costDistribution);

    if (saveCost) {
      await this.costsRepository.save(cost);
    }

    return costDistribution;
  }
}
