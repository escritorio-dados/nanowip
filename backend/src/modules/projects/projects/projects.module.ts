import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { ProjectsController } from './controllers/projects.controller';
import { ProjectsServiceModule } from './projects.service.module';

@Module({
  imports: [ProjectsServiceModule, CaslModule],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
