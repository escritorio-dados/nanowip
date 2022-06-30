import { Module } from '@nestjs/common';

import { IntegratedObjectivesRepositoryModule } from './integratedObjectives.repository.module';
import { CommonIntegratedObjectiveService } from './services/common.integratedObjective.service';
import { CreateIntegratedObjectiveService } from './services/create.integratedObjective.service';
import { DeleteIntegratedObjectiveService } from './services/delete.integratedObjective.service';
import { FindAllIntegratedObjectiveService } from './services/findAll.integratedObjective.service';
import { FindOneIntegratedObjectiveService } from './services/findOne.integratedObjective.service';
import { UpdateIntegratedObjectiveService } from './services/update.integratedObjective.service';

@Module({
  imports: [IntegratedObjectivesRepositoryModule],
  providers: [
    CommonIntegratedObjectiveService,
    FindAllIntegratedObjectiveService,
    FindOneIntegratedObjectiveService,
    CreateIntegratedObjectiveService,
    UpdateIntegratedObjectiveService,
    DeleteIntegratedObjectiveService,
  ],
  exports: [
    FindAllIntegratedObjectiveService,
    FindOneIntegratedObjectiveService,
    CreateIntegratedObjectiveService,
    UpdateIntegratedObjectiveService,
    DeleteIntegratedObjectiveService,
  ],
})
export class IntegratedObjectivesServiceModule {}
