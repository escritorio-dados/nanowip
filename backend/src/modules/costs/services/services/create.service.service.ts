import { Injectable } from '@nestjs/common';

import { ServiceDto } from '../dtos/service.dto';
import { ServicesRepository } from '../repositories/services.repository';
import { CommonServiceService } from './common.service.service';

type ICreateServiceService = ServiceDto & { organization_id: string };

@Injectable()
export class CreateServiceService {
  constructor(
    private servicesRepository: ServicesRepository,
    private commonServiceService: CommonServiceService,
  ) {}

  async execute({ name, organization_id }: ICreateServiceService) {
    await this.commonServiceService.validadeName({ name, organization_id });

    const service = await this.servicesRepository.create({
      name: name.trim(),
      organization_id,
    });

    return service;
  }
}
