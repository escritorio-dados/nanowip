import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { ValueChainsController } from './controllers/valueChains.controller';
import { ValueChainsServiceModule } from './valueChains.service.module';

@Module({
  imports: [ValueChainsServiceModule, CaslModule],
  controllers: [ValueChainsController],
})
export class ValueChainsModule {}
