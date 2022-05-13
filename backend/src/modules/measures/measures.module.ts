import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { MeasuresController } from './controllers/measures.controller';
import { MeasuresServiceModule } from './measures.service.module';

@Module({
  controllers: [MeasuresController],
  imports: [MeasuresServiceModule, CaslModule],
})
export class MeasuresModule {}
