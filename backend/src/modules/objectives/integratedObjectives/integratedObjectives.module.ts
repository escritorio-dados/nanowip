import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { IntegratedObjectivesController } from './controllers/integratedObjectives.controller';
import { IntegratedObjectivesServiceModule } from './integratedObjectives.service.module';

@Module({
  imports: [IntegratedObjectivesServiceModule, CaslModule],
  controllers: [IntegratedObjectivesController],
})
export class IntegratedObjectivesModule {}
