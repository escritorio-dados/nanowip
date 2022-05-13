import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { CostsRepository } from '@modules/costs/costs/repositories/costs.repository';
import { FindOneCostService } from '@modules/costs/costs/services/findOne.cost.service';
import { FindOneServiceService } from '@modules/costs/services/services/findOne.service.service';
import { FindOneProductService } from '@modules/products/services/findOne.product.service';

import { CreateCostDistributionDto } from '../dtos/create.costDistribution.dto';
import { ICreateCostDistributionRepositoryDto } from '../dtos/create.costDistribution.repository.dto';
import { CostDistributionsRepository } from '../repositories/costDistributions.repository';

type ICreateCostDistributionService = CreateCostDistributionDto & { organization_id: string };

@Injectable()
export class CreateCostDistributionService {
  constructor(
    private costDistributionsRepository: CostDistributionsRepository,

    private costsRepository: CostsRepository,
    private findOneCostService: FindOneCostService,
    private findOneProductService: FindOneProductService,
    private findOneServiceService: FindOneServiceService,
  ) {}

  async execute({
    organization_id,
    cost_id,
    percent,
    product_id,
    service_id,
  }: ICreateCostDistributionService) {
    const newCostDistribution: ICreateCostDistributionRepositoryDto = {
      organization_id,
    } as ICreateCostDistributionRepositoryDto;

    const fixedPercent = percent / 100;

    // Pegando o custo
    const cost = await this.findOneCostService.execute({ id: cost_id, organization_id });

    newCostDistribution.cost = cost;

    if (1 - cost.percentDistributed < fixedPercent) {
      const allowed = 1 - cost.percentDistributed;

      throw new AppError({
        message: `maximum value allowed: ${allowed * 100}%`,
        userMessage: `valor maximo permitido: ${allowed * 100}%`,
      });
    }

    newCostDistribution.percent = fixedPercent;

    newCostDistribution.product = await this.findOneProductService.execute({
      id: product_id,
      organization_id,
    });

    if (service_id) {
      newCostDistribution.service = await this.findOneServiceService.execute({
        id: service_id,
        organization_id,
      });
    }

    // Salvando no banco de dados a atribuição
    const costDistribution = await this.costDistributionsRepository.create(newCostDistribution);

    // Alterando a porcentagem do custo
    cost.percentDistributed += fixedPercent;

    await this.costsRepository.save(cost);

    return costDistribution;
  }
}
