import { Module } from '@nestjs/common';

import { CreateTagService } from './services/create.tag.service';
import { DeleteTagService } from './services/delete.tag.service';
import { FindAllTagService } from './services/findAll.tag.service';
import { TagsRepositoryModule } from './tags.repository.module';

@Module({
  imports: [TagsRepositoryModule],
  providers: [CreateTagService, DeleteTagService, FindAllTagService],
  exports: [CreateTagService, DeleteTagService, FindAllTagService],
})
export class TagsServiceModule {}
