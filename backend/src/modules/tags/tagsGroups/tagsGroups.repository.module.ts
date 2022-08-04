import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagsGroup } from './entities/TagsGroup';
import { TagsGroupsRepository } from './repositories/tagsGroups.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TagsGroup])],
  providers: [TagsGroupsRepository],
  exports: [TagsGroupsRepository],
})
export class TagsGroupsRepositoryModule {}
