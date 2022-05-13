import { Module } from '@nestjs/common';

import { CollaboratorsServiceModule } from '@modules/collaborators/collaborators.service.module';

import { CollaboratorsStatusRepositoryModule } from './collaborators.repository.module';
import { CommonCollaboratorStatusService } from './services/common.collaboratorStatus.service';
import { CreateCollaboratorStatusService } from './services/create.collaboratorStatus.service';
import { DeleteCollaboratorStatusService } from './services/delete.collaboratorStatus.service';
import { FindAllCollaboratorStatusService } from './services/findAll.collaboratorStatus.service';
import { FindOneCollaboratorStatusService } from './services/findOne.collaboratorStatus.service';
import { UpdateCollaboratorStatusService } from './services/update.collaboratorStatus.service';

@Module({
  imports: [CollaboratorsStatusRepositoryModule, CollaboratorsServiceModule],
  providers: [
    CommonCollaboratorStatusService,
    FindAllCollaboratorStatusService,
    FindOneCollaboratorStatusService,
    CreateCollaboratorStatusService,
    UpdateCollaboratorStatusService,
    DeleteCollaboratorStatusService,
  ],
  exports: [
    FindAllCollaboratorStatusService,
    FindOneCollaboratorStatusService,
    CreateCollaboratorStatusService,
    UpdateCollaboratorStatusService,
    DeleteCollaboratorStatusService,
  ],
})
export class CollaboratorStatusServiceModule {}
