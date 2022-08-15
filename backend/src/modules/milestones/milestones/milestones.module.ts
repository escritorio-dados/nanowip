import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { MilestonesController } from './controllers/milestones.controller';
import { MilestonesServiceModule } from './milestones.service.module';

@Module({
  imports: [MilestonesServiceModule, CaslModule],
  controllers: [MilestonesController],
})
export class MilestonesModule {}
