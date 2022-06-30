import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrailSection } from './entities/TrailSection';
import { TrailSectionsRepository } from './repositories/trailSections.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TrailSection])],
  providers: [TrailSectionsRepository],
  exports: [TrailSectionsRepository],
})
export class TrailSectionsRepositoryModule {}
