import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliverableTag } from './entities/DeliverableTag';
import { DeliverableTagsRepository } from './repositories/deliverableTags.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeliverableTag])],
  providers: [DeliverableTagsRepository],
  exports: [DeliverableTagsRepository],
})
export class DeliverableTagsRepositoryModule {}
