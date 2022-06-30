import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { SectionTrailsController } from './controllers/sectionTrails.controller';
import { InstantiateSectionTrailServiceModule } from './instantiateTrail.service.module';
import { SectionTrailsServiceModule } from './sectionTrails.service.module';

@Module({
  imports: [SectionTrailsServiceModule, CaslModule, InstantiateSectionTrailServiceModule],
  controllers: [SectionTrailsController],
})
export class SectionTrailsModule {}
