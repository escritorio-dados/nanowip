import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { ProductTypesController } from './controllers/productTypes.controller';
import { ProductTypesServiceModule } from './productTypes.service.module';

@Module({
  controllers: [ProductTypesController],
  imports: [ProductTypesServiceModule, CaslModule],
})
export class ProductTypesModule {}
