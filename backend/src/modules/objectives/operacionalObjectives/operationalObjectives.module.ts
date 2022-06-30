import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { OperationalObjectivesController } from './controllers/operationalObjectives.controller';
import { OperationalObjectivesServiceModule } from './operationalObjectives.service.module';

@Module({
  imports: [OperationalObjectivesServiceModule, CaslModule],
  controllers: [OperationalObjectivesController],
})
export class OperationalObjectivesModule {}
