import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { ProjectTypesController } from './controllers/projectTypes.controller';
import { ProjectTypesServiceModule } from './projectTypes.service.module';

@Module({
  controllers: [ProjectTypesController],
  imports: [ProjectTypesServiceModule, CaslModule],
})
export class ProjectTypesModule {}
