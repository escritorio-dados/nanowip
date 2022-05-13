import { Injectable } from '@nestjs/common';

import { getStatusDate } from '@shared/utils/getStatusDate';
import { ServiceDatesController } from '@shared/utils/ServiceDatesController';
import { validadeDates } from '@shared/utils/validadeDates';

import { FindOneMeasureService } from '@modules/measures/services/findOne.measure.service';
import { FindOneProductTypeService } from '@modules/productTypes/services/findOne.productType.service';
import { FindOneProjectService } from '@modules/projects/services/findOne.project.service';
import { FixDatesProjectService } from '@modules/projects/services/fixDates.project.service';

import { ICreateProductRepositoryDto } from '../dtos/create.product.repository.dto';
import { ProductDto } from '../dtos/product.dto';
import { ProductsRepository } from '../repositories/products.repository';
import { CommonProductService } from './common.product.service';
import { FixDatesProductService } from './fixDates.product.service';

type ICreateProductService = ProductDto & { organization_id: string };

@Injectable()
export class CreateProductService {
  constructor(
    private productsRepository: ProductsRepository,
    private commonProductService: CommonProductService,
    private fixDatesProductService: FixDatesProductService,

    private findOneProductTypeService: FindOneProductTypeService,
    private findOneMeasureService: FindOneMeasureService,
    private findOneProjectService: FindOneProjectService,
    private fixDatesProjectService: FixDatesProjectService,
  ) {}

  async execute({
    name,
    measure_id,
    product_parent_id,
    project_id,
    product_type_id,
    quantity,
    deadline,
    availableDate,
    endDate,
    startDate,
    organization_id,
  }: ICreateProductService) {
    const newProduct: ICreateProductRepositoryDto = {
      organization_id,
    } as ICreateProductRepositoryDto;

    // Validando e atribuindo o nome
    await this.commonProductService.validateName({ name, product_parent_id, project_id });

    newProduct.name = name.trim();

    // Validando e atribuindo o tipo de produto
    newProduct.productType = await this.findOneProductTypeService.execute({
      id: product_type_id,
      organization_id,
    });

    // Validando e atribuindo a unidade de medida
    newProduct.measure = await this.findOneMeasureService.execute({
      id: measure_id,
      organization_id,
    });

    newProduct.quantity = quantity;

    // Validando e atribuindo o Parent (Projeto ou Produto)
    if (product_parent_id) {
      const productParent = await this.commonProductService.getProduct({
        id: product_parent_id,
        organization_id,
      });

      await this.commonProductService.validateProductParent(productParent);

      newProduct.productParent = productParent;
    } else {
      newProduct.project = await this.findOneProjectService.execute({
        id: project_id,
        organization_id,
      });
    }

    // Validando e atribuindo as datas
    validadeDates({ available: availableDate, end: endDate, start: startDate });

    newProduct.deadline = deadline;
    newProduct.availableDate = availableDate;
    newProduct.startDate = startDate;
    newProduct.endDate = endDate;

    // Salvando no Banco de dados
    const product = await this.productsRepository.create(newProduct);

    const serviceDateController = new ServiceDatesController(product);

    // Causando os efeitos colaterais
    if (product.product_parent_id) {
      await this.fixDatesProductService.verifyDatesChanges({
        product_id: product.product_parent_id,
        ...serviceDateController.getCreateParams(),
      });
    } else {
      await this.fixDatesProjectService.verifyDatesChanges({
        project_id: product.project_id,
        ...serviceDateController.getCreateParams(),
      });
    }

    return {
      ...product,
      statusDate: getStatusDate(product),
      subprojects: [],
    };
  }
}
