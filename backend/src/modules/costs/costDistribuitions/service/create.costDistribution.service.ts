import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { CostsRepository } from '@modules/costs/costs/repositories/costs.repository';
import { FindOneCostService } from '@modules/costs/costs/services/findOne.cost.service';
import { FindOneProductService } from '@modules/products/products/services/findOne.product.service';
import { FindOneTaskTypeService } from '@modules/tasks/taskTypes/services/findOne.taskType.service';

import { CreateCostDistributionDto } from '../dtos/create.costDistribution.dto';
import { CostDistributionsRepository } from '../repositories/costDistributions.repository';
import { ICreateCostDistributionRepository } from '../repositories/types';

type ICreateCostDistributionService = CreateCostDistributionDto & { organization_id: string };

@Injectable()
export class CreateCostDistributionService {
  constructor(
    private costDistributionsRepository: CostDistributionsRepository,

    private costsRepository: CostsRepository,
    private findOneCostService: FindOneCostService,
    private findOneProductService: FindOneProductService,
    private findOneTaskTypeService: FindOneTaskTypeService,
  ) {}

  async execute({
    organization_id,
    cost_id,
    percent,
    product_id,
    task_type_id,
  }: ICreateCostDistributionService) {
    const newCostDistribution = {
      organization_id,
    } as ICreateCostDistributionRepository;

    const fixedPercent = percent / 100;

    // Pegando o custo
    const cost = await this.findOneCostService.execute({
      id: cost_id,
      organization_id,
      relations: ['costsDistributions'],
    });

    newCostDistribution.cost = cost;

    const costTotalPercent = cost.costsDistributions.reduce((total, cd) => {
      total += cd.percent;
      return total;
    }, 0);

    if (1 - costTotalPercent < fixedPercent) {
      const allowed = 1 - costTotalPercent;

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

    if (task_type_id) {
      newCostDistribution.taskType = await this.findOneTaskTypeService.execute({
        id: task_type_id,
        organization_id,
      });
    }

    // Salvando no banco de dados a atribuição
    const costDistribution = await this.costDistributionsRepository.create(newCostDistribution);

    // Alterando a porcentagem do custo
    cost.costsDistributions = undefined; // Evitar problemas com relation

    cost.percentDistributed = costTotalPercent + fixedPercent;

    await this.costsRepository.save(cost);

    return costDistribution;
  }
}
