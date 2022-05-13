import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { CostsRepository } from '@modules/costs/costs/repositories/costs.repository';
import { FindOneServiceService } from '@modules/costs/services/services/findOne.service.service';
import { FindOneProductService } from '@modules/products/services/findOne.product.service';

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
    private findOneServiceService: FindOneServiceService,
  ) {}

  async execute({
    id,
    organization_id,
    percent,
    product_id,
    service_id,
  }: IUpdateCostDistributionService) {
    const costDistribution = await this.commonCostDistributionService.getCostDistribution({
      id,
      relations: ['cost'],
      organization_id,
    });

    const { cost } = costDistribution;

    let saveCost = false;

    const fixedPercent = percent / 100;

    if (costDistribution.percent !== fixedPercent) {
      const newPercentDistributed = cost.percentDistributed - costDistribution.percent;

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

    if (costDistribution.service_id !== service_id) {
      if (service_id) {
        costDistribution.service = await this.findOneServiceService.execute({
          id: service_id,
          organization_id,
        });

        costDistribution.service_id = service_id;
      } else {
        costDistribution.service_id = null;
      }
    }

    await this.costDistributionsRepository.save(costDistribution);

    if (saveCost) {
      await this.costsRepository.save(cost);
    }

    return costDistribution;
  }
}
