import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { ProductsController } from './controllers/products.controller';
import { ProductsServiceModule } from './products.service.module';

@Module({
  imports: [ProductsServiceModule, CaslModule],
  controllers: [ProductsController],
})
export class ProductsModule {}
