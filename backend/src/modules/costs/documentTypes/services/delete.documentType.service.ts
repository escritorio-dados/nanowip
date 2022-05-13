import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { documentTypeErrors } from '../errors/documentType.errors';
import { DocumentTypesRepository } from '../repositories/documentTypes.repository';
import { CommonDocumentTypeService } from './common.documentType.service';

type IDeleteDocumentTypeService = { id: string; organization_id: string };

@Injectable()
export class DeleteDocumentTypeService {
  constructor(
    private documentTypesRepository: DocumentTypesRepository,
    private commonDocumentTypeService: CommonDocumentTypeService,
  ) {}

  async execute({ id, organization_id }: IDeleteDocumentTypeService) {
    const documentType = await this.commonDocumentTypeService.getDocumentType({
      id,
      relations: ['costs'],
      organization_id,
    });

    if (documentType.costs.length > 0) {
      throw new AppError(documentTypeErrors.deleteWithCosts);
    }

    await this.documentTypesRepository.delete(documentType);
  }
}
