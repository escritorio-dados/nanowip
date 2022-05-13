import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { CollaboratorStatusServiceModule } from './collaboratorsStatus.service.module';
import { CollaboratorStatusController } from './controllers/collaboratorStatus.controller';

@Module({
  controllers: [CollaboratorStatusController],
  imports: [CollaboratorStatusServiceModule, CaslModule],
})
export class CollaboratorsStatusModule {}
