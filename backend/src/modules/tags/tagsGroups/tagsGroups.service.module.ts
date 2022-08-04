import { Module } from '@nestjs/common';

import { TagsServiceModule } from '../tags/tags.service.module';
import { CommonTagsGroupService } from './services/common.tagsGroup.service';
import { CreateTagsGroupService } from './services/create.tagsGroup.service';
import { DeleteTagsGroupService } from './services/delete.tagsGroup.service';
import { UpdateTagsGroupService } from './services/update.tagsGroup.service';
import { TagsGroupsRepositoryModule } from './tagsGroups.repository.module';

@Module({
  imports: [TagsGroupsRepositoryModule, TagsServiceModule],
  providers: [
    CreateTagsGroupService,
    CommonTagsGroupService,
    DeleteTagsGroupService,
    UpdateTagsGroupService,
  ],
  exports: [
    CreateTagsGroupService,
    CommonTagsGroupService,
    DeleteTagsGroupService,
    UpdateTagsGroupService,
  ],
})
export class TagsGroupsServiceModule {}
