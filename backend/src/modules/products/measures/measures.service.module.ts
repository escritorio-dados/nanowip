import { Module } from '@nestjs/common';

import { MeasuresRepositoryModule } from './measures.repository.module';
import { CommonMeasureService } from './services/common.measure.service';
import { CreateMeasureService } from './services/create.measure.service';
import { DeleteMeasureService } from './services/delete.measure.service';
import { FindAllMeasureService } from './services/findAll.measure.service';
import { FindOneMeasureService } from './services/findOne.measure.service';
import { UpdateMeasureService } from './services/update.measure.service';

@Module({
  imports: [MeasuresRepositoryModule],
  providers: [
    CommonMeasureService,
    FindAllMeasureService,
    FindOneMeasureService,
    CreateMeasureService,
    UpdateMeasureService,
    DeleteMeasureService,
  ],
  exports: [
    FindAllMeasureService,
    FindOneMeasureService,
    CreateMeasureService,
    UpdateMeasureService,
    DeleteMeasureService,
  ],
})
export class MeasuresServiceModule {}
