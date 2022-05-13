import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { TrackersController } from './controllers/trackers.controller';
import { TrackersServiceModule } from './trackers.service.module';

@Module({
  imports: [TrackersServiceModule, CaslModule],
  controllers: [TrackersController],
})
export class TrackersModule {}
