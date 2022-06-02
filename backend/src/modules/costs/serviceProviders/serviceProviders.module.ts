import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { ServiceProvidersController } from './controllers/serviceProviders.controller';
import { ServiceProvidersServiceModule } from './serviceProviders.service.module';

@Module({
  imports: [ServiceProvidersServiceModule, CaslModule],
  controllers: [ServiceProvidersController],
})
export class ServiceProvidersModule {}
