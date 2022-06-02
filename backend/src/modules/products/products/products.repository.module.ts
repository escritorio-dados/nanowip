import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './entities/Product';
import { ProductsRepository } from './repositories/products.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsRepository],
  exports: [ProductsRepository],
})
export class ProductsRepositoryModule {}
