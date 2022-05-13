import { Injectable } from '@nestjs/common';

import { ProductTypeDto } from '../dtos/productType.dto';
import { ProductTypesRepository } from '../repositories/productTypes.repository';
import { CommonProductTypeService } from './common.productType.service';

type ICreateProductTypeService = ProductTypeDto & { organization_id: string };

@Injectable()
export class CreateProductTypeService {
  constructor(
    private productTypesRepository: ProductTypesRepository,
    private commonProductTypeService: CommonProductTypeService,
  ) {}

  async execute({ name, organization_id }: ICreateProductTypeService) {
    await this.commonProductTypeService.validadeName({ name, organization_id });

    const productType = await this.productTypesRepository.create({
      name: name.trim(),
      organization_id,
    });

    return productType;
  }
}
