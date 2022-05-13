import { Injectable } from '@nestjs/common';

import { getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';

import { ProductsRepository } from '../repositories/products.repository';
import { CommonProductService } from './common.product.service';

type IFindOneProductService = { id: string; organization_id: string };

@Injectable()
export class FindOneProductService {
  constructor(
    private commonProductService: CommonProductService,
    private productsRepository: ProductsRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneProductService) {
    const product = await this.productsRepository.findByIdInfo(id);

    this.commonProductService.validateProduct({ organization_id, product });

    const productFormatted = {
      ...product,
      statusDate: getStatusDate(product),
      pathString: getParentPathString({
        entity: product,
        getCustomer: true,
        skipFirstName: true,
        entityType: 'product',
      }),
    };

    return productFormatted;
  }

  async execute({ id, organization_id }: IFindOneProductService) {
    const product = await this.commonProductService.getProduct({ id, organization_id });

    return product;
  }
}
