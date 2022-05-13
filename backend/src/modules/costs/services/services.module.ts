import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { ServicesController } from './controllers/services.controller';
import { ServicesServiceModule } from './services.service.module';

@Module({
  imports: [ServicesServiceModule, CaslModule],
  controllers: [ServicesController],
})
export class ServicesModule {}
