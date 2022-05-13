import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentTypeCost } from './entities/DocumentType';
import { DocumentTypesRepository } from './repositories/documentTypes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentTypeCost])],
  providers: [DocumentTypesRepository],
  exports: [DocumentTypesRepository],
})
export class DocumentTypesRepositoryModule {}
