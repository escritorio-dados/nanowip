import { Injectable } from '@nestjs/common';

import {
  recalculateAvailableDate,
  recalculateEndDate,
  recalculateStartDate,
} from '@shared/utils/changeDatesAux';
import { DatesController } from '@shared/utils/ServiceDatesController';

import { FixDatesProductService } from '@modules/products/services/fixDates.product.service';
import { ValueChainsRepository } from '@modules/valueChains/repositories/valueChains.repository';

@Injectable()
export class FixDatesValueChainService {
  constructor(
    private valueChainsRepository: ValueChainsRepository,

    private fixDatesProductService: FixDatesProductService,
  ) {}

  async recalculateDates(value_chain_id: string, mode: 'full' | 'start' | 'end' | 'available') {
    const valueChain = await this.valueChainsRepository.findById(value_chain_id, ['tasks']);

    const datesController = new DatesController({
      start: valueChain.startDate,
      end: valueChain.endDate,
      available: valueChain.availableDate,
    });

    // Data de inicio
    if (mode === 'available' || mode === 'full') {
      valueChain.availableDate = recalculateAvailableDate(valueChain.tasks);
    }

    // Data de inicio
    if (mode === 'start' || mode === 'full') {
      valueChain.startDate = recalculateStartDate(valueChain.tasks);
    }

    // Data de término
    if (mode === 'end' || mode === 'full') {
      valueChain.endDate = recalculateEndDate(valueChain.tasks);
    }

    datesController.updateDates({
      start: valueChain.startDate,
      end: valueChain.endDate,
      available: valueChain.availableDate,
    });

    if (datesController.needChangeDates()) {
      await this.valueChainsRepository.save(valueChain);

      await this.fixDatesProductService.recalculateDates(
        valueChain.product_id,
        datesController.getMode(),
      );
    }
  }
}
