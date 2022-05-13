import { Injectable } from '@nestjs/common';

import { ServiceDto } from '../dtos/service.dto';
import { ServicesRepository } from '../repositories/services.repository';
import { CommonServiceService } from './common.service.service';

type IUpdateServiceService = ServiceDto & { id: string; organization_id: string };

@Injectable()
export class UpdateServiceService {
  constructor(
    private servicesRepository: ServicesRepository,
    private commonServiceService: CommonServiceService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateServiceService) {
    const service = await this.commonServiceService.getService({
      id,
      organization_id,
    });

    if (service.name.toLowerCase() !== name.trim().toLowerCase()) {
      await this.commonServiceService.validadeName({ name, organization_id });
    }

    service.name = name.trim();

    await this.servicesRepository.save(service);

    return service;
  }
}
