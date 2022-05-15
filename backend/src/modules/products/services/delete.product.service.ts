import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { ServiceDatesController } from '@shared/utils/ServiceDatesController';

import { FixDatesProjectService } from '@modules/projects/services/fixDates.project.service';

import { productErrors } from '../errors/product.errors';
import { ProductsRepository } from '../repositories/products.repository';
import { CommonProductService } from './common.product.service';
import { FixDatesProductService } from './fixDates.product.service';

type IDeleteProductService = { id: string; organization_id: string };

@Injectable()
export class DeleteProductService {
  constructor(
    private productsRepository: ProductsRepository,
    private commonProductService: CommonProductService,
    private fixDatesProductService: FixDatesProductService,

    private fixDatesProjectService: FixDatesProjectService,
  ) {}

  async execute({ id, organization_id }: IDeleteProductService) {
    const product = await this.commonProductService.getProduct({
      id,
      relations: ['valueChains', 'subproducts', 'costs'],
      organization_id,
    });

    if (product.subproducts.length > 0) {
      throw new AppError(productErrors.deleteWithSubproducts);
    }

    if (product.valueChains.length > 0) {
      throw new AppError(productErrors.deleteWithValueChains);
    }

    if (product.costs.length > 0) {
      throw new AppError(productErrors.deleteWithCosts);
    }

    await this.productsRepository.delete(product);

    const serviceDateController = new ServiceDatesController(product);

    // Causando os efeitos Colaterais
    if (product.product_parent_id) {
      await this.fixDatesProductService.verifyDatesChanges({
        product_id: product.product_parent_id,
        ...serviceDateController.getDeleteParams(),
      });
    } else {
      await this.fixDatesProjectService.verifyDatesChanges({
        project_id: product.project_id,
        ...serviceDateController.getDeleteParams(),
      });
    }
  }
}
