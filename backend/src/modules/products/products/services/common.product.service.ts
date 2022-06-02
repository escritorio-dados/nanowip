import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Product } from '@modules/products/products/entities/Product';
import { productErrors } from '@modules/products/products/errors/product.errors';
import { ProductsRepository } from '@modules/products/products/repositories/products.repository';

import { IFindByNameProductRepository } from '../repositories/types';

type IGetProduct = { id: string; relations?: string[]; organization_id: string };

type IValidateProduct = { product: Product; organization_id: string };

@Injectable()
export class CommonProductService {
  constructor(private productsRepository: ProductsRepository) {}

  async validateName({ name, product_parent_id, project_id }: IFindByNameProductRepository) {
    const product = await this.productsRepository.findByName({
      name: name.trim(),
      product_parent_id,
      project_id,
    });

    if (product) {
      throw new AppError(productErrors.duplicateName);
    }
  }

  validateProduct({ product, organization_id }: IValidateProduct) {
    if (!product) {
      throw new AppError(productErrors.notFound);
    }

    validateOrganization({ entity: product, organization_id });
  }

  async getProduct({ id, organization_id, relations }: IGetProduct) {
    const product = await this.productsRepository.findById(id, relations);

    this.validateProduct({ product, organization_id });

    return product;
  }

  async validateProductWithSubproducts(product_id: string) {
    const subproducts = await this.productsRepository.findAllByParent(product_id);

    if (subproducts.length > 0) {
      throw new AppError(productErrors.productWithSubproductsToSubproduct);
    }
  }

  validateProductParent(productParent: Product) {
    if (!productParent.project_id || productParent.product_parent_id) {
      throw new AppError(productErrors.subproductsOfsubproducts);
    }
  }
}
