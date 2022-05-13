import { Module } from '@nestjs/common';

import { PortfoliosRepositoryModule } from './portfolios.repository.module';
import { CommonPortfolioService } from './services/common.portfolio.service';
import { CreatePortfolioService } from './services/create.portfolio.service';
import { DeletePortfolioService } from './services/delete.portfolio.service';
import { FindAllPortfolioService } from './services/findAll.portfolio.service';
import { FindOnePortfolioService } from './services/findOne.portfolio.service';
import { UpdatePortfolioService } from './services/update.portfolio.service';

@Module({
  imports: [PortfoliosRepositoryModule],
  providers: [
    CommonPortfolioService,
    FindAllPortfolioService,
    FindOnePortfolioService,
    CreatePortfolioService,
    UpdatePortfolioService,
    DeletePortfolioService,
  ],
  exports: [
    FindAllPortfolioService,
    FindOnePortfolioService,
    CreatePortfolioService,
    UpdatePortfolioService,
    DeletePortfolioService,
  ],
})
export class PortfoliosServiceModule {}
