import { Injectable } from '@nestjs/common';

import {
  recalculateAvailableDate,
  recalculateEndDate,
  recalculateStartDate,
} from '@shared/utils/changeDatesAux';
import { DatesController } from '@shared/utils/ServiceDatesController';

import { FixDatesProjectService } from '@modules/projects/projects/services/fixDates.project.service';

import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class FixDatesProductService {
  constructor(
    private productsRepository: ProductsRepository,

    private fixDatesProjectService: FixDatesProjectService,
  ) {}

  async recalculateDates(product_id: string, mode: 'full' | 'start' | 'end' | 'available') {
    const product = await this.productsRepository.findById(product_id, [
      'valueChains',
      'subproducts',
    ]);

    const datesController = new DatesController({
      start: product.startDate,
      end: product.endDate,
      available: product.availableDate,
    });

    const subEntities = [...product.valueChains, ...product.subproducts];

    // Data de inicio
    if (mode === 'available' || mode === 'full') {
      product.availableDate = recalculateAvailableDate(subEntities);
    }

    // Data de inicio
    if (mode === 'start' || mode === 'full') {
      product.startDate = recalculateStartDate(subEntities);
    }

    // Data de término
    if (mode === 'end' || mode === 'full') {
      product.endDate = recalculateEndDate(subEntities);
    }

    datesController.updateDates({
      start: product.startDate,
      end: product.endDate,
      available: product.availableDate,
    });

    if (datesController.needChangeDates()) {
      await this.productsRepository.save(product);

      if (product.product_parent_id) {
        await this.recalculateDates(product.product_parent_id, datesController.getMode());
      } else if (product.project_id) {
        await this.fixDatesProjectService.recalculateDates(
          product.project_id,
          datesController.getMode(),
        );
      }
    }
  }
}
