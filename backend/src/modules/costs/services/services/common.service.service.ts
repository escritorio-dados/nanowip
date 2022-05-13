import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Service } from '../entities/Service';
import { serviceErrors } from '../errors/service.errors';
import { ServicesRepository } from '../repositories/services.repository';

type IGetServiceProps = { id: string; relations?: string[]; organization_id: string };

type IValidateNameService = { name: string; organization_id: string };

type IValidateService = { service: Service; organization_id: string };

@Injectable()
export class CommonServiceService {
  constructor(private servicesRepository: ServicesRepository) {}

  async validadeName({ name, organization_id }: IValidateNameService) {
    const service = await this.servicesRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (service) {
      throw new AppError(serviceErrors.duplicateName);
    }
  }

  async getService({ id, relations, organization_id }: IGetServiceProps) {
    const service = await this.servicesRepository.findById({ id, relations });

    this.validateService({ service, organization_id });

    return service;
  }

  validateService({ service, organization_id }: IValidateService) {
    if (!service) {
      throw new AppError(serviceErrors.notFound);
    }

    validateOrganization({ entity: service, organization_id });
  }
}
