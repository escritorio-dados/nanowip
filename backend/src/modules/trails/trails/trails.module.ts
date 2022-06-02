import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { TrailsController } from './controllers/trails.controller';
import { InstantiateTrailServiceModule } from './instantiateTrail.service.module';
import { TrailsServiceModule } from './trails.service.module';

@Module({
  imports: [TrailsServiceModule, InstantiateTrailServiceModule, CaslModule],
  controllers: [TrailsController],
})
export class TrailsModule {}
