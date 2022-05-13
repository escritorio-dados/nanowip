import { Injectable } from '@nestjs/common';

import { sliceList } from '@shared/utils/sliceList';

import { CostsRepository } from '../repositories/costs.repository';

type IRecalculatePercentCostService = { organization_id: string };

@Injectable()
export class RecalculatePercentCostService {
  constructor(private costsRepository: CostsRepository) {}

  async execute({ organization_id }: IRecalculatePercentCostService) {
    const costs = await this.costsRepository.findAll(organization_id, ['costsDistributions']);

    // Separando as tarefas em pacotes menores (Para conseguir salvar) (2000 Registros por pacote)
    const slicedCosts = sliceList({ array: costs, maxLenght: 2000 });

    for await (const costsSliced of slicedCosts) {
      const costsRecalculated = costsSliced.map(cost => {
        const totalPercent = cost.costsDistributions.reduce(
          (total, costDist) => total + costDist.percent,
          0,
        );

        return {
          ...cost,
          percent_distributed: totalPercent,
        };
      });

      await this.costsRepository.saveAll(costsRecalculated);
    }
  }
}
