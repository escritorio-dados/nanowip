import { Injectable } from '@nestjs/common';

import { ServiceProviderDto } from '../dtos/serviceProvider.dto';
import { ServiceProvidersRepository } from '../repositories/serviceProviders.repository';
import { CommonServiceProviderService } from './common.serviceProvider.service';

type IUpdateServiceProviderService = ServiceProviderDto & { id: string; organization_id: string };

@Injectable()
export class UpdateServiceProviderService {
  constructor(
    private serviceProvidersRepository: ServiceProvidersRepository,
    private commonServiceProviderService: CommonServiceProviderService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateServiceProviderService) {
    const serviceProvider = await this.commonServiceProviderService.getServiceProvider({
      id,
      organization_id,
    });

    if (serviceProvider.name.toLowerCase() !== name.trim().toLowerCase()) {
      await this.commonServiceProviderService.validadeName({ name, organization_id });
    }

    serviceProvider.name = name.trim();

    await this.serviceProvidersRepository.save(serviceProvider);

    return serviceProvider;
  }
}
