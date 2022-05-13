import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Service } from './entities/Service';
import { ServicesRepository } from './repositories/services.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  providers: [ServicesRepository],
  exports: [ServicesRepository],
})
export class ServicesRepositoryModule {}
