import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { TrailSectionsController } from './controllers/trailSections.controller';
import { TrailSectionsServiceModule } from './trailSections.service.module';

@Module({
  imports: [TrailSectionsServiceModule, CaslModule],
  controllers: [TrailSectionsController],
})
export class TrailSectionsModule {}
