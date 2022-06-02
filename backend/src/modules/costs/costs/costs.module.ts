import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { CostsController } from './controllers/costs.controller';
import { CostsServiceModule } from './costs.service.module';

@Module({
  imports: [CostsServiceModule, CaslModule],
  controllers: [CostsController],
})
export class CostsModule {}
