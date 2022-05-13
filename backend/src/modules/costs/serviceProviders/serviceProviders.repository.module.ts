import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceProvider } from './entities/ServiceProvider';
import { ServiceProvidersRepository } from './repositories/serviceProviders.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceProvider])],
  providers: [ServiceProvidersRepository],
  exports: [ServiceProvidersRepository],
})
export class ServiceProvidersRepositoryModule {}
