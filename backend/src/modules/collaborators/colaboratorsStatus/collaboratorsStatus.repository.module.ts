import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollaboratorStatus } from './entities/CollaboratorStatus';
import { CollaboratorsStatusRepository } from './repositories/collaboratorStatus.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CollaboratorStatus])],
  providers: [CollaboratorsStatusRepository],
  exports: [CollaboratorsStatusRepository],
})
export class CollaboratorsStatusRepositoryModule {}
