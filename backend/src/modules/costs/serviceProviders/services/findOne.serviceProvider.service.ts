import { Injectable } from '@nestjs/common';

import { ServiceProvidersRepository } from '../repositories/serviceProviders.repository';
import { CommonServiceProviderService } from './common.serviceProvider.service';

type IFindOneServiceProviderService = { id: string; organization_id: string };

@Injectable()
export class FindOneServiceProviderService {
  constructor(
    private commonServiceProviderService: CommonServiceProviderService,
    private serviceProvidersRepository: ServiceProvidersRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneServiceProviderService) {
    const serviceProvider = await this.serviceProvidersRepository.findById({ id });

    this.commonServiceProviderService.validateServiceProvider({ serviceProvider, organization_id });

    return serviceProvider;
  }

  async execute({ id, organization_id }: IFindOneServiceProviderService) {
    return this.commonServiceProviderService.getServiceProvider({ id, organization_id });
  }
}
