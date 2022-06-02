import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './entities/Project';
import { ProjectsRepository } from './repositories/projects.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  providers: [ProjectsRepository],
  exports: [ProjectsRepository],
})
export class ProjectsRepositoryModule {}
