import { Injectable } from '@nestjs/common';

import { ProductTypeDto } from '../dtos/productType.dto';
import { ProductTypesRepository } from '../repositories/productTypes.repository';
import { CommonProductTypeService } from './common.productType.service';

type IUpdateProductTypeService = ProductTypeDto & { id: string; organization_id: string };

@Injectable()
export class UpdateProductTypeService {
  constructor(
    private productTypesRepository: ProductTypesRepository,
    private commonProductTypeService: CommonProductTypeService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateProductTypeService) {
    const productType = await this.commonProductTypeService.getProductType({ id, organization_id });

    if (productType.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonProductTypeService.validadeName({ name, organization_id });
    }

    productType.name = name.trim();

    await this.productTypesRepository.save(productType);

    return productType;
  }
}
