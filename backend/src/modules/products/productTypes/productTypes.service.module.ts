import { Module } from '@nestjs/common';

import { ProductTypesRepositoryModule } from './productTypes.repository.module';
import { CommonProductTypeService } from './services/common.productType.service';
import { CreateProductTypeService } from './services/create.productType.service';
import { DeleteProductTypeService } from './services/delete.productType.service';
import { FindAllProductTypeService } from './services/findAll.productType.service';
import { FindOneProductTypeService } from './services/findOne.productType.service';
import { UpdateProductTypeService } from './services/update.productType.service';

@Module({
  imports: [ProductTypesRepositoryModule],
  providers: [
    CommonProductTypeService,
    FindAllProductTypeService,
    FindOneProductTypeService,
    CreateProductTypeService,
    UpdateProductTypeService,
    DeleteProductTypeService,
  ],
  exports: [
    FindAllProductTypeService,
    FindOneProductTypeService,
    CreateProductTypeService,
    UpdateProductTypeService,
    DeleteProductTypeService,
  ],
})
export class ProductTypesServiceModule {}
