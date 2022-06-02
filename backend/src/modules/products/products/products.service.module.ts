import { forwardRef, Module } from '@nestjs/common';

import { MeasuresServiceModule } from '@modules/products/measures/measures.service.module';
import { ProductTypesServiceModule } from '@modules/products/productTypes/productTypes.service.module';
import { ProjectsServiceModule } from '@modules/projects/projects/projects.service.module';

import { ProductsRepositoryModule } from './products.repository.module';
import { CommonProductService } from './services/common.product.service';
import { CreateProductService } from './services/create.product.service';
import { DeleteProductService } from './services/delete.product.service';
import { FindAllProductService } from './services/findAll.product.service';
import { FindOneProductService } from './services/findOne.product.service';
import { FixDatesProductService } from './services/fixDates.product.service';
import { RecalculateDatesProductService } from './services/recalculateDates.product.service';
import { UpdateProductService } from './services/update.product.service';

@Module({
  imports: [
    ProductsRepositoryModule,
    ProductTypesServiceModule,
    MeasuresServiceModule,
    forwardRef(() => ProjectsServiceModule),
  ],
  providers: [
    CommonProductService,
    FindAllProductService,
    FindOneProductService,
    CreateProductService,
    UpdateProductService,
    DeleteProductService,
    FixDatesProductService,
    RecalculateDatesProductService,
  ],
  exports: [
    FindAllProductService,
    FindOneProductService,
    CreateProductService,
    UpdateProductService,
    DeleteProductService,
    FixDatesProductService,
    RecalculateDatesProductService,
  ],
})
export class ProductsServiceModule {}
