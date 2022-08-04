import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tag } from './entities/Tag';
import { TagsRepository } from './repositories/tags.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  providers: [TagsRepository],
  exports: [TagsRepository],
})
export class TagsRepositoryModule {}
