import { Injectable } from '@nestjs/common';

import { DocumentTypeDto } from '../dtos/documentType.dto';
import { DocumentTypesRepository } from '../repositories/documentTypes.repository';
import { CommonDocumentTypeService } from './common.documentType.service';

type ICreateDocumentTypeService = DocumentTypeDto & { organization_id: string };

@Injectable()
export class CreateDocumentTypeService {
  constructor(
    private documentTypesRepository: DocumentTypesRepository,
    private commonDocumentTypeService: CommonDocumentTypeService,
  ) {}

  async execute({ name, organization_id }: ICreateDocumentTypeService) {
    await this.commonDocumentTypeService.validadeName({ name, organization_id });

    const documentType = await this.documentTypesRepository.create({
      name: name.trim(),
      organization_id,
    });

    return documentType;
  }
}
