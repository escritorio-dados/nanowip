import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { MilestonesGroupsServiceModule } from './milestonesGroups.service.module';

@Module({
  imports: [MilestonesGroupsServiceModule, CaslModule],
  controllers: [],
})
export class MilestonesGroupsModule {}
