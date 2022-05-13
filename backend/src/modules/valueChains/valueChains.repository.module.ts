import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ValueChain } from './entities/ValueChain';
import { ValueChainsRepository } from './repositories/valueChains.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ValueChain])],
  providers: [ValueChainsRepository],
  exports: [ValueChainsRepository],
})
export class ValueChainsRepositoryModule {}
