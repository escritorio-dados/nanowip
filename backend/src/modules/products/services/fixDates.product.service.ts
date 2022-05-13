import { Injectable } from '@nestjs/common';

import {
  INeedRecalculate,
  verifyChangesEndDates,
  verifyChangesInitDates,
  verifyNeedRecalculate,
} from '@shared/utils/changeDatesAux';
import { DatesChangesController, IOldNewDatesFormat } from '@shared/utils/DatesChangeController';

import { FixDatesProjectService } from '@modules/projects/services/fixDates.project.service';

import { ProductsRepository } from '../repositories/products.repository';

type IVerifyDatesChanges = IOldNewDatesFormat & {
  product_id: string;
  deleted?: boolean;
};

@Injectable()
export class FixDatesProductService {
  constructor(
    private productsRepository: ProductsRepository,

    private fixDatesProjectService: FixDatesProjectService,
  ) {}

  async validadeSubEntities(data: INeedRecalculate) {
    const needRecalculate = verifyNeedRecalculate(data);

    if (needRecalculate) {
      const { valueChains, subproducts } = await this.productsRepository.findById(
        data.currentObject.id,
        ['valueChains', 'subproducts'],
      );

      return [...valueChains, ...subproducts];
    }

    return undefined;
  }

  async verifyDatesChanges({ product_id, start, available, end, deleted }: IVerifyDatesChanges) {
    if (!available && !end && !start && !deleted) {
      return;
    }

    const product = await this.productsRepository.findById(product_id);

    const datesController = new DatesChangesController(product);

    const subEntities = await this.validadeSubEntities({
      currentObject: product,
      available,
      deleted,
      end,
      start,
    });

    if (available) {
      product.availableDate = await verifyChangesInitDates({
        datesController,
        currentDate: product.availableDate,
        newDate: available.new,
        oldDate: available.old,
        subEntities,
        type: 'changeAvailable',
      });
    }

    if (start) {
      product.startDate = await verifyChangesInitDates({
        datesController,
        currentDate: product.startDate,
        newDate: start.new,
        oldDate: start.old,
        subEntities,
        type: 'changeStart',
      });
    }

    if (end || deleted) {
      product.endDate = await verifyChangesEndDates({
        datesController,
        currentDate: product.endDate,
        newDate: end?.new,
        subEntities,
        deleted,
      });
    }

    if (datesController.needSave()) {
      await this.productsRepository.save(product);

      if (product.product_parent_id) {
        await this.verifyDatesChanges({
          product_id: product.product_parent_id,
          ...datesController.getUpdateDatesParams({
            newAvailableDate: product.availableDate,
            newStartDate: product.startDate,
            newEndDate: product.endDate,
          }),
        });
      } else if (product.project_id) {
        await this.fixDatesProjectService.verifyDatesChanges({
          project_id: product.project_id,
          ...datesController.getUpdateDatesParams({
            newAvailableDate: product.availableDate,
            newStartDate: product.startDate,
            newEndDate: product.endDate,
          }),
        });
      }
    }
  }
}
