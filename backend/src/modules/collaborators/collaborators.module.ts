import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { CollaboratorsServiceModule } from './collaborators.service.module';
import { CollaboratorController } from './controllers/collaborators.controller';

@Module({
  controllers: [CollaboratorController],
  imports: [CollaboratorsServiceModule, CaslModule],
})
export class CollaboratorsModule {}
