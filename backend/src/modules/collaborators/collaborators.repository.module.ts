import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Collaborator } from './entities/Collaborator';
import { CollaboratorsRepository } from './repositories/collaborators.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Collaborator])],
  providers: [CollaboratorsRepository],
  exports: [CollaboratorsRepository],
})
export class CollaboratorsRepositoryModule {}
