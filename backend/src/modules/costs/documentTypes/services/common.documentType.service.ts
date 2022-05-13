import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { DocumentTypeCost } from '../entities/DocumentType';
import { documentTypeErrors } from '../errors/documentType.errors';
import { DocumentTypesRepository } from '../repositories/documentTypes.repository';

type IGetDocumentTypeProps = { id: string; relations?: string[]; organization_id: string };

type IValidateNameDocumentType = { name: string; organization_id: string };

type IValidateDocumentType = { documentType: DocumentTypeCost; organization_id: string };

@Injectable()
export class CommonDocumentTypeService {
  constructor(private documentTypesRepository: DocumentTypesRepository) {}

  async validadeName({ name, organization_id }: IValidateNameDocumentType) {
    const documentType = await this.documentTypesRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (documentType) {
      throw new AppError(documentTypeErrors.duplicateName);
    }
  }

  async getDocumentType({ id, relations, organization_id }: IGetDocumentTypeProps) {
    const documentType = await this.documentTypesRepository.findById({ id, relations });

    this.validateDocumentType({ documentType, organization_id });

    return documentType;
  }

  validateDocumentType({ documentType, organization_id }: IValidateDocumentType) {
    if (!documentType) {
      throw new AppError(documentTypeErrors.notFound);
    }

    validateOrganization({ entity: documentType, organization_id });
  }
}
