import { Module } from '@nestjs/common';

import { DocumentTypesRepositoryModule } from './documentTypes.repository.module';
import { CommonDocumentTypeService } from './services/common.documentType.service';
import { CreateDocumentTypeService } from './services/create.documentType.service';
import { DeleteDocumentTypeService } from './services/delete.documentType.service';
import { FindAllDocumentTypeService } from './services/findAll.documentType.service';
import { FindOneDocumentTypeService } from './services/findOne.documentType.service';
import { UpdateDocumentTypeService } from './services/update.documentType.service';

@Module({
  imports: [DocumentTypesRepositoryModule],
  providers: [
    CommonDocumentTypeService,
    FindAllDocumentTypeService,
    FindOneDocumentTypeService,
    CreateDocumentTypeService,
    UpdateDocumentTypeService,
    DeleteDocumentTypeService,
  ],
  exports: [
    FindAllDocumentTypeService,
    FindOneDocumentTypeService,
    CreateDocumentTypeService,
    UpdateDocumentTypeService,
    DeleteDocumentTypeService,
  ],
})
export class DocumentTypesServiceModule {}
