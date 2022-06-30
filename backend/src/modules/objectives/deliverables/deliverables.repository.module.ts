import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Deliverable } from './entities/Deliverable';
import { DeliverablesRepository } from './repositories/deliverables.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Deliverable])],
  providers: [DeliverablesRepository],
  exports: [DeliverablesRepository],
})
export class DeliverablesRepositoryModule {}
