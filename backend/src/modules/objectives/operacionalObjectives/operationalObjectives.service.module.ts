import { Module } from '@nestjs/common';

import { IntegratedObjectivesServiceModule } from '../integratedObjectives/integratedObjectives.service.module';
import { OperationalObjectivesRepositoryModule } from './operationalObjectives.repository.module';
import { CommonOperationalObjectiveService } from './services/common.operationalObjective.service';
import { CreateOperationalObjectiveService } from './services/create.operationalObjective.service';
import { DeleteOperationalObjectiveService } from './services/delete.operationalObjective.service';
import { FindAllOperationalObjectiveService } from './services/findAll.operationalObjective.service';
import { FindOneOperationalObjectiveService } from './services/findOne.operationalObjective.service';
import { UpdateOperationalObjectiveService } from './services/update.operationalObjective.service';

@Module({
  imports: [OperationalObjectivesRepositoryModule, IntegratedObjectivesServiceModule],
  providers: [
    CommonOperationalObjectiveService,
    FindAllOperationalObjectiveService,
    FindOneOperationalObjectiveService,
    CreateOperationalObjectiveService,
    UpdateOperationalObjectiveService,
    DeleteOperationalObjectiveService,
  ],
  exports: [
    FindAllOperationalObjectiveService,
    FindOneOperationalObjectiveService,
    CreateOperationalObjectiveService,
    UpdateOperationalObjectiveService,
    DeleteOperationalObjectiveService,
  ],
})
export class OperationalObjectivesServiceModule {}
