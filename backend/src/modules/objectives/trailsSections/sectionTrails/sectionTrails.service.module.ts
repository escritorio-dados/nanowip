import { Module } from '@nestjs/common';

import { SectionTrailsRepositoryModule } from './sectionTrails.repository.module';
import { CommonSectionTrailService } from './services/common.sectionTrail.service';
import { CreateSectionTrailService } from './services/create.sectionTrail.service';
import { DeleteSectionTrailService } from './services/delete.sectionTrail.service';
import { FindAllSectionTrailService } from './services/findAll.sectionTrail.service';
import { FindOneSectionTrailService } from './services/findOne.sectionTrail.service';
import { UpdateSectionTrailService } from './services/update.sectionTrail.service';

@Module({
  imports: [SectionTrailsRepositoryModule],
  providers: [
    CommonSectionTrailService,
    FindAllSectionTrailService,
    FindOneSectionTrailService,
    CreateSectionTrailService,
    UpdateSectionTrailService,
    DeleteSectionTrailService,
  ],
  exports: [
    CommonSectionTrailService,
    FindAllSectionTrailService,
    FindOneSectionTrailService,
    CreateSectionTrailService,
    UpdateSectionTrailService,
    DeleteSectionTrailService,
  ],
})
export class SectionTrailsServiceModule {}
