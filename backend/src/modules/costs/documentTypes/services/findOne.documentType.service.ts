import { Injectable } from '@nestjs/common';

import { DocumentTypesRepository } from '../repositories/documentTypes.repository';
import { CommonDocumentTypeService } from './common.documentType.service';

type IFindOneDocumentTypeService = { id: string; organization_id: string };

@Injectable()
export class FindOneDocumentTypeService {
  constructor(
    private commonDocumentTypeService: CommonDocumentTypeService,
    private documentTypesRepository: DocumentTypesRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneDocumentTypeService) {
    const documentType = await this.documentTypesRepository.findById({ id });

    this.commonDocumentTypeService.validateDocumentType({ documentType, organization_id });

    return documentType;
  }

  async execute({ id, organization_id }: IFindOneDocumentTypeService) {
    return this.commonDocumentTypeService.getDocumentType({ id, organization_id });
  }
}
