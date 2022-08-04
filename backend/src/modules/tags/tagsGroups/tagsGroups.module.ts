import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { TagsGroupsServiceModule } from './tagsGroups.service.module';

@Module({
  imports: [TagsGroupsServiceModule, CaslModule],
  controllers: [],
})
export class TagsGroupsModule {}
