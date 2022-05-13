import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Portfolio } from './entities/Portfolio';
import { PortfoliosRepository } from './repositories/portfolios.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio])],
  providers: [PortfoliosRepository],
  exports: [PortfoliosRepository],
})
export class PortfoliosRepositoryModule {}
