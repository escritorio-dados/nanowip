import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { serviceProviderErrors } from '../errors/serviceProvider.errors';
import { ServiceProvidersRepository } from '../repositories/serviceProviders.repository';
import { CommonServiceProviderService } from './common.serviceProvider.service';

type IDeleteServiceProviderService = { id: string; organization_id: string };

@Injectable()
export class DeleteServiceProviderService {
  constructor(
    private serviceProvidersRepository: ServiceProvidersRepository,
    private commonServiceProviderService: CommonServiceProviderService,
  ) {}

  async execute({ id, organization_id }: IDeleteServiceProviderService) {
    const serviceProvider = await this.commonServiceProviderService.getServiceProvider({
      id,
      relations: ['costs'],
      organization_id,
    });

    if (serviceProvider.costs.length > 0) {
      throw new AppError(serviceProviderErrors.deleteWithCosts);
    }

    await this.serviceProvidersRepository.delete(serviceProvider);
  }
}
