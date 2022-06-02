import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductType } from './entities/ProductType';
import { ProductTypesRepository } from './repositories/productTypes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductType])],
  providers: [ProductTypesRepository],
  exports: [ProductTypesRepository],
})
export class ProductTypesRepositoryModule {}
