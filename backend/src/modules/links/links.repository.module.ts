import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Link } from './entities/Link';
import { LinksRepository } from './repositories/links.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Link])],
  providers: [LinksRepository],
  exports: [LinksRepository],
})
export class LinksRepositoryModule {}
