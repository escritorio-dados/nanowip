import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { ObjectiveSectionsController } from './controllers/objectiveSections.controller';
import { ObjectiveSectionsServiceModule } from './objectiveSections.service.module';

@Module({
  imports: [ObjectiveSectionsServiceModule, CaslModule],
  controllers: [ObjectiveSectionsController],
})
export class ObjectiveSectionsModule {}
