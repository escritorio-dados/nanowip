import { Injectable } from '@nestjs/common';

import { ServiceProviderDto } from '../dtos/serviceProvider.dto';
import { ServiceProvidersRepository } from '../repositories/serviceProviders.repository';
import { CommonServiceProviderService } from './common.serviceProvider.service';

type ICreateServiceProviderService = ServiceProviderDto & { organization_id: string };

@Injectable()
export class CreateServiceProviderService {
  constructor(
    private serviceProvidersRepository: ServiceProvidersRepository,
    private commonServiceProviderService: CommonServiceProviderService,
  ) {}

  async execute({ name, organization_id }: ICreateServiceProviderService) {
    await this.commonServiceProviderService.validadeName({ name, organization_id });

    const serviceProvider = await this.serviceProvidersRepository.create({
      name: name.trim(),
      organization_id,
    });

    return serviceProvider;
  }
}
