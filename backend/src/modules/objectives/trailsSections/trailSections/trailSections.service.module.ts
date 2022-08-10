import { Module } from '@nestjs/common';

import { TagsGroupsServiceModule } from '@modules/tags/tagsGroups/tagsGroups.service.module';

import { SectionTrailsServiceModule } from '../sectionTrails/sectionTrails.service.module';
import { CommonTrailSectionService } from './services/common.trailSection.service';
import { CreateTrailSectionService } from './services/create.trailSection.service';
import { DeleteTrailSectionService } from './services/delete.trailSection.service';
import { FindAllTrailSectionService } from './services/findAll.trailSection.service';
import { FindOneTrailSectionService } from './services/findOne.trailSection.service';
import { UpdateTrailSectionService } from './services/update.trailSection.service';
import { TrailSectionsRepositoryModule } from './trailSections.repository.module';

@Module({
  imports: [TrailSectionsRepositoryModule, SectionTrailsServiceModule, TagsGroupsServiceModule],
  providers: [
    CommonTrailSectionService,
    CreateTrailSectionService,
    FindAllTrailSectionService,
    FindOneTrailSectionService,
    UpdateTrailSectionService,
    DeleteTrailSectionService,
  ],
  exports: [
    CreateTrailSectionService,
    FindAllTrailSectionService,
    FindOneTrailSectionService,
    UpdateTrailSectionService,
    DeleteTrailSectionService,
  ],
})
export class TrailSectionsServiceModule {}
