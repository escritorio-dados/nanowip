import { Injectable } from '@nestjs/common';

import { DocumentTypeDto } from '../dtos/documentType.dto';
import { DocumentTypesRepository } from '../repositories/documentTypes.repository';
import { CommonDocumentTypeService } from './common.documentType.service';

type IUpdateDocumentTypeService = DocumentTypeDto & { id: string; organization_id: string };

@Injectable()
export class UpdateDocumentTypeService {
  constructor(
    private documentTypesRepository: DocumentTypesRepository,
    private commonDocumentTypeService: CommonDocumentTypeService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateDocumentTypeService) {
    const documentType = await this.commonDocumentTypeService.getDocumentType({
      id,
      organization_id,
    });

    if (documentType.name.toLowerCase() !== name.trim().toLowerCase()) {
      await this.commonDocumentTypeService.validadeName({ name, organization_id });
    }

    documentType.name = name.trim();

    await this.documentTypesRepository.save(documentType);

    return documentType;
  }
}
