import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { ServiceProvider } from '../entities/ServiceProvider';
import { serviceProviderErrors } from '../errors/serviceProvider.errors';
import { ServiceProvidersRepository } from '../repositories/serviceProviders.repository';

type IGetServiceProviderProps = { id: string; relations?: string[]; organization_id: string };

type IValidateNameServiceProvider = { name: string; organization_id: string };

type IValidateServiceProvider = { serviceProvider: ServiceProvider; organization_id: string };

@Injectable()
export class CommonServiceProviderService {
  constructor(private serviceProvidersRepository: ServiceProvidersRepository) {}

  async validadeName({ name, organization_id }: IValidateNameServiceProvider) {
    const serviceProvider = await this.serviceProvidersRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (serviceProvider) {
      throw new AppError(serviceProviderErrors.duplicateName);
    }
  }

  async getServiceProvider({ id, relations, organization_id }: IGetServiceProviderProps) {
    const serviceProvider = await this.serviceProvidersRepository.findById({ id, relations });

    this.validateServiceProvider({ serviceProvider, organization_id });

    return serviceProvider;
  }

  validateServiceProvider({ serviceProvider, organization_id }: IValidateServiceProvider) {
    if (!serviceProvider) {
      throw new AppError(serviceProviderErrors.notFound);
    }

    validateOrganization({ entity: serviceProvider, organization_id });
  }
}
