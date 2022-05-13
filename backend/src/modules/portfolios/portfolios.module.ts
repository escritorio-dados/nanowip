import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { PortfoliosController } from './controllers/portfolios.controller';
import { PortfoliosServiceModule } from './portfolios.service.module';

@Module({
  imports: [PortfoliosServiceModule, CaslModule],
  controllers: [PortfoliosController],
})
export class PortfoliosModule {}
