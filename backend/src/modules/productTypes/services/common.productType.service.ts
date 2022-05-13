import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { productTypeErrors } from '../errors/productType.errors';
import { ProductTypesRepository } from '../repositories/productTypes.repository';

type IValidateName = { name: string; organization_id: string };
type IGetProductType = { id: string; organization_id: string; relations?: string[] };

@Injectable()
export class CommonProductTypeService {
  constructor(private productTypesRepository: ProductTypesRepository) {}

  async validadeName({ name, organization_id }: IValidateName) {
    const productTypeWithSameName = await this.productTypesRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (productTypeWithSameName) {
      throw new AppError(productTypeErrors.duplicateName);
    }
  }

  async getProductType({ id, organization_id, relations }: IGetProductType) {
    const productType = await this.productTypesRepository.findById(id, relations);

    if (!productType) {
      throw new AppError(productTypeErrors.notFound);
    }

    validateOrganization({ entity: productType, organization_id });

    return productType;
  }
}
