import { forwardRef, Module } from '@nestjs/common';

import { MeasuresServiceModule } from '@modules/measures/measures.service.module';
import { ProductTypesServiceModule } from '@modules/productTypes/productTypes.service.module';
import { ProjectsServiceModule } from '@modules/projects/projects.service.module';
import { ValueChainsServiceModule } from '@modules/valueChains/valueChains.service.module';

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
    forwardRef(() => ValueChainsServiceModule),
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
