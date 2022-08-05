import { forwardRef, Module } from '@nestjs/common';

import { TaskTrailsServiceModule } from '../taskTrails/taskTrails.service.module';
import { CommonTrailService } from './services/common.trail.service';
import { CreateTrailService } from './services/create.trail.service';
import { DeleteTrailService } from './services/delete.trail.service';
import { FindAllTrailService } from './services/findAll.trail.service';
import { FindOneTrailService } from './services/findOne.trail.service';
import { UpdateTrailService } from './services/update.trail.service';
import { TrailsRepositoryModule } from './trails.repository.module';

@Module({
  imports: [TrailsRepositoryModule, forwardRef(() => TaskTrailsServiceModule)],
  providers: [
    CommonTrailService,
    FindAllTrailService,
    FindOneTrailService,
    CreateTrailService,
    UpdateTrailService,
    DeleteTrailService,
  ],
  exports: [
    FindAllTrailService,
    FindOneTrailService,
    CreateTrailService,
    UpdateTrailService,
    DeleteTrailService,
  ],
})
export class TrailsServiceModule {}
