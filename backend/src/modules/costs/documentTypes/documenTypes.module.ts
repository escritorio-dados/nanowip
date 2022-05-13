import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { DocumentTypesController } from './controllers/documentTypes.controller';
import { DocumentTypesServiceModule } from './documentTypes.service.module';

@Module({
  imports: [DocumentTypesServiceModule, CaslModule],
  controllers: [DocumentTypesController],
})
export class DocumentTypesModule {}
