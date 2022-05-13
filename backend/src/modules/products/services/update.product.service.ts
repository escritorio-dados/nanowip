import { Injectable } from '@nestjs/common';

import { ServiceDatesController } from '@shared/utils/ServiceDatesController';
import { validadeDates } from '@shared/utils/validadeDates';

import { FindOneMeasureService } from '@modules/measures/services/findOne.measure.service';
import { FindOneProductTypeService } from '@modules/productTypes/services/findOne.productType.service';
import { FindOneProjectService } from '@modules/projects/services/findOne.project.service';
import { FixDatesProjectService } from '@modules/projects/services/fixDates.project.service';

import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/Product';
import { ProductsRepository } from '../repositories/products.repository';
import { CommonProductService } from './common.product.service';
import { FixDatesProductService } from './fixDates.product.service';

type IResolveParentProps = {
  project_id?: string;
  product_parent_id?: string;
  product: Product;
  name: string;
};

type IUpdateProductService = ProductDto & { organization_id: string; id: string };

type IUpdateDatesParent = {
  product: Product;
  serviceDatesController: ServiceDatesController;
  parentController: {
    old_project_id?: string;
    old_product_parent_id?: string;
  };
};

@Injectable()
export class UpdateProductService {
  constructor(
    private productsRepository: ProductsRepository,
    private commonProductService: CommonProductService,
    private fixDatesProductService: FixDatesProductService,

    private findOneProductTypeService: FindOneProductTypeService,
    private findOneMeasureService: FindOneMeasureService,
    private findOneProjectService: FindOneProjectService,
    private fixDatesProjectService: FixDatesProjectService,
  ) {}

  async resolveParent({ product, project_id, product_parent_id, name }: IResolveParentProps) {
    const changeParent =
      (project_id && product.project_id !== project_id) ||
      (product_parent_id && product.product_parent_id !== product_parent_id);

    if (changeParent) {
      await this.commonProductService.validateName({
        name,
        project_id,
        product_parent_id,
      });

      if (project_id) {
        product.project = await this.findOneProjectService.execute({
          id: project_id,
          organization_id: product.organization_id,
        });

        product.project_id = project_id;
        product.product_parent_id = null;
      } else {
        product.productParent = await this.commonProductService.getProduct({
          id: product_parent_id,
          organization_id: product.organization_id,
        });

        this.commonProductService.validateProductParent(product.productParent);

        await this.commonProductService.validateProductWithSubproducts(product.id);

        product.product_parent_id = product_parent_id;
        product.project_id = null;
      }
    }
  }

  private async updateDatesParent({
    parentController,
    product,
    serviceDatesController,
  }: IUpdateDatesParent) {
    const changedParent =
      parentController.old_product_parent_id !== product.product_parent_id ||
      parentController.old_project_id !== product.project_id;

    serviceDatesController.updateDates(product, changedParent);

    if (serviceDatesController.needChangeDates()) {
      // Aplicando a mudança de datas caso seja necessario no local atual dela
      if (product.product_parent_id) {
        await this.fixDatesProductService.verifyDatesChanges({
          product_id: product.product_parent_id,
          ...serviceDatesController.getUpdateParams(),
        });
      } else {
        await this.fixDatesProjectService.verifyDatesChanges({
          project_id: product.project_id,
          ...serviceDatesController.getUpdateParams(),
        });
      }

      // Se houve mudança de local, aplicando as mudanças no local antigo
      if (changedParent) {
        if (parentController.old_product_parent_id) {
          await this.fixDatesProductService.verifyDatesChanges({
            product_id: parentController.old_product_parent_id,
            ...serviceDatesController.getUpdateParamsDelete(),
          });
        } else {
          await this.fixDatesProjectService.verifyDatesChanges({
            project_id: parentController.old_project_id,
            ...serviceDatesController.getUpdateParamsDelete(),
          });
        }
      }
    }
  }

  async execute({
    id,
    name,
    measure_id,
    product_parent_id,
    project_id,
    product_type_id,
    quantity,
    availableDate,
    endDate,
    startDate,
    deadline,
    organization_id,
  }: IUpdateProductService): Promise<Product> {
    const product = await this.commonProductService.getProduct({ id, organization_id });

    // Variavel de controle das datas
    const serviceDatesController = new ServiceDatesController(product);

    // Alterando Unidade de medida
    if (product.measure_id !== measure_id) {
      product.measure = await this.findOneMeasureService.execute({
        id: measure_id,
        organization_id,
      });
    }

    product.quantity = quantity;

    // Alterando Tipo de produto
    if (product.product_type_id !== product_type_id) {
      product.productType = await this.findOneProductTypeService.execute({
        id: product_type_id,
        organization_id,
      });
    }

    // Alterando parent
    const parentController = {
      old_project_id: product.project_id,
      old_product_parent_id: product.product_parent_id,
    };

    await this.resolveParent({ name, product, product_parent_id, project_id });

    // Alterando Nome
    if (product.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonProductService.validateName({ name, product_parent_id, project_id });
    }

    product.name = name.trim();

    // Alterando datas fixas
    validadeDates({ available: availableDate, end: endDate, start: startDate });

    product.deadline = deadline;
    product.availableDate = availableDate;
    product.startDate = startDate;
    product.endDate = endDate;

    // Salvando alterações
    await this.productsRepository.save(product);

    // Aplicando alterações de datas no Path acima
    await this.updateDatesParent({ parentController, product, serviceDatesController });

    return product;
  }
}
