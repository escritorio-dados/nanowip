import { Injectable } from '@nestjs/common';

import {
  INeedRecalculate,
  verifyChangesEndDates,
  verifyChangesInitDates,
  verifyNeedRecalculate,
} from '@shared/utils/changeDatesAux';
import { DatesChangesController, IOldNewDatesFormat } from '@shared/utils/DatesChangeController';

import { FixDatesProductService } from '@modules/products/services/fixDates.product.service';
import { TasksRepository } from '@modules/tasks/repositories/tasks.repository';
import { ValueChainsRepository } from '@modules/valueChains/repositories/valueChains.repository';

type IVerifyDatesChanges = IOldNewDatesFormat & {
  value_chain_id: string;
  deleted?: boolean;
};

@Injectable()
export class FixDatesValueChainService {
  constructor(
    private valueChainsRepository: ValueChainsRepository,

    private tasksRepository: TasksRepository,
    private fixDatesProductService: FixDatesProductService,
  ) {}

  async validadeSubEntities(data: INeedRecalculate) {
    const needRecalculate = verifyNeedRecalculate(data);

    if (needRecalculate) {
      const { tasks } = await this.valueChainsRepository.findById(data.currentObject.id, ['tasks']);

      return tasks;
    }

    return undefined;
  }

  async verifyDatesChanges({
    value_chain_id,
    start,
    available,
    end,
    deleted,
  }: IVerifyDatesChanges) {
    if (!available && !end && !start && !deleted) {
      return;
    }

    const valueChain = await this.valueChainsRepository.findById(value_chain_id);

    const datesController = new DatesChangesController(valueChain);

    const subEntities = await this.validadeSubEntities({
      currentObject: valueChain,
      available,
      deleted,
      end,
      start,
    });

    if (available) {
      valueChain.availableDate = await verifyChangesInitDates({
        datesController,
        currentDate: valueChain.availableDate,
        newDate: available.new,
        oldDate: available.old,
        subEntities,
        type: 'changeAvailable',
      });
    }

    if (start) {
      valueChain.startDate = await verifyChangesInitDates({
        datesController,
        currentDate: valueChain.startDate,
        newDate: start.new,
        oldDate: start.old,
        subEntities,
        type: 'changeStart',
      });
    }

    if (end || deleted) {
      valueChain.endDate = await verifyChangesEndDates({
        datesController,
        currentDate: valueChain.endDate,
        newDate: end?.new,
        subEntities,
        deleted,
      });
    }

    if (datesController.needSave()) {
      await this.valueChainsRepository.save(valueChain);

      await this.fixDatesProductService.verifyDatesChanges({
        product_id: valueChain.product_id,
        ...datesController.getUpdateDatesParams({
          newAvailableDate: valueChain.availableDate,
          newStartDate: valueChain.startDate,
          newEndDate: valueChain.endDate,
        }),
      });
    }
  }
}
