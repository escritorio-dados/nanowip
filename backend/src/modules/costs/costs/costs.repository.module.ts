import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cost } from './entities/Cost';
import { CostsRepository } from './repositories/costs.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Cost])],
  providers: [CostsRepository],
  exports: [CostsRepository],
})
export class CostsRepositoryModule {}
