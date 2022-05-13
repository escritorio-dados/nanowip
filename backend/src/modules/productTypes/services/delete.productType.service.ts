import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { productTypeErrors } from '../errors/productType.errors';
import { ProductTypesRepository } from '../repositories/productTypes.repository';
import { CommonProductTypeService } from './common.productType.service';

type IDeleteProductTypeService = { id: string; organization_id: string };

@Injectable()
export class DeleteProductTypeService {
  constructor(
    private productTypesRepository: ProductTypesRepository,
    private commonProductTypeService: CommonProductTypeService,
  ) {}

  async execute({ id, organization_id }: IDeleteProductTypeService) {
    const productType = await this.commonProductTypeService.getProductType({
      id,
      relations: ['products'],
      organization_id,
    });

    if (productType.products.length > 0) {
      throw new AppError(productTypeErrors.deleteWithProducts);
    }

    await this.productTypesRepository.delete(productType);
  }
}
