import { Injectable } from '@nestjs/common';

import { ServicesRepository } from '../repositories/services.repository';
import { CommonServiceService } from './common.service.service';

type IFindOneServiceService = { id: string; organization_id: string };

@Injectable()
export class FindOneServiceService {
  constructor(
    private commonServiceService: CommonServiceService,
    private servicesRepository: ServicesRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneServiceService) {
    const service = await this.servicesRepository.findById({ id });

    this.commonServiceService.validateService({ service, organization_id });

    return service;
  }

  async execute({ id, organization_id }: IFindOneServiceService) {
    return this.commonServiceService.getService({ id, organization_id });
  }
}
