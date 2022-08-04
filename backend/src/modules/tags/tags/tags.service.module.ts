import { Module } from '@nestjs/common';

import { CreateTagService } from './service/create.tag.service';
import { DeleteTagService } from './service/delete.tag.service';
import { FindAllTagService } from './service/findAll.tag.service';
import { TagsRepositoryModule } from './tags.repository.module';

@Module({
  imports: [TagsRepositoryModule],
  providers: [CreateTagService, DeleteTagService, FindAllTagService],
  exports: [CreateTagService, DeleteTagService, FindAllTagService],
})
export class TagsServiceModule {}
