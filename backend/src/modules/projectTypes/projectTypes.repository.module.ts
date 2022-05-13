import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectType } from './entities/ProjectType';
import { ProjectTypesRepository } from './repositories/projectTypes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectType])],
  providers: [ProjectTypesRepository],
  exports: [ProjectTypesRepository],
})
export class ProjectTypesRepositoryModule {}
