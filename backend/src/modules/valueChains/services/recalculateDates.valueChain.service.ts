import { Injectable } from '@nestjs/common';
import { min } from 'date-fns';

import { recalculateStartDate, recalculateEndDate } from '@shared/utils/changeDatesAux';
import { sliceList } from '@shared/utils/sliceList';

import { Task } from '@modules/tasks/tasks/entities/Task';
import { ValueChainsRepository } from '@modules/valueChains/repositories/valueChains.repository';

import { ValueChain } from '../entities/ValueChain';

type IRecalculateDates = { organization_id: string; product_id?: string };

@Injectable()
export class RecalculateDatesValueChainService {
  constructor(private valueChainsRepository: ValueChainsRepository) {}

  private recalculateAvailableDate(tasks: Task[]): Date | null {
    // Pegando somente as datas de disponibilidade, e removendo da lista as datas vazias
    const dates = tasks.map(({ availableDate }) => availableDate).filter(date => !!date);

    // Se alguma ja está disponivel vai renornar a menor data entre eles
    if (dates.length >= 1) {
      return min(dates);
    }

    // Se nenhuma inicou retorna null
    return null;
  }

  async recalculateDates({ organization_id, product_id }: IRecalculateDates) {
    let valueChains: ValueChain[] = [];

    // Pegar todos os valueChains junto com os seus tasks
    if (product_id) {
      valueChains = await this.valueChainsRepository.findAllByProduct({
        product_id,
        organization_id,
        relations: ['tasks'],
      });
    } else {
      valueChains = await this.valueChainsRepository.findAll({
        relations: ['tasks'],
        organization_id,
      });
    }

    // Separando o array em porções menores para conseguir salvar
    const slicedValueChains = sliceList({ array: valueChains, maxLenght: 2000 });

    for await (const sliceValueChains of slicedValueChains) {
      const valueChainsRecalculated = sliceValueChains.map(valueChain => {
        const availableCalculated = this.recalculateAvailableDate(valueChain.tasks);

        const startCalculated = recalculateStartDate(valueChain.tasks);

        const endCalculated = recalculateEndDate(valueChain.tasks);

        return {
          ...valueChain,
          availableDate: availableCalculated,
          startDate: startCalculated,
          endDate: endCalculated,
        };
      });

      await this.valueChainsRepository.saveAll(valueChainsRecalculated);
    }
  }
}
