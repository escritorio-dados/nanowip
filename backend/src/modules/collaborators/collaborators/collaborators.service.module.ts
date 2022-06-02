import { forwardRef, Module } from '@nestjs/common';

import { UsersServiceModule } from '@modules/users/users/users.service.module';

import { CollaboratorsRepositoryModule } from './collaborators.repository.module';
import { CommonCollaboratorService } from './services/common.collaborator.service';
import { CreateCollaboratorService } from './services/create.collaborator.service';
import { DeleteCollaboratorService } from './services/delete.collaborator.service';
import { FindAllCollaboratorService } from './services/findAll.collaborator.service';
import { FindOneCollaboratorService } from './services/findOne.collaborator.service';
import { UpdateCollaboratorService } from './services/update.collaborator.service';

@Module({
  imports: [CollaboratorsRepositoryModule, forwardRef(() => UsersServiceModule)],
  providers: [
    CommonCollaboratorService,
    FindAllCollaboratorService,
    FindOneCollaboratorService,
    CreateCollaboratorService,
    UpdateCollaboratorService,
    DeleteCollaboratorService,
  ],
  exports: [
    FindAllCollaboratorService,
    FindOneCollaboratorService,
    CreateCollaboratorService,
    UpdateCollaboratorService,
    DeleteCollaboratorService,
  ],
})
export class CollaboratorsServiceModule {}
