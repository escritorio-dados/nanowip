import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { serviceErrors } from '../errors/service.errors';
import { ServicesRepository } from '../repositories/services.repository';
import { CommonServiceService } from './common.service.service';

type IDeleteServiceService = { id: string; organization_id: string };

@Injectable()
export class DeleteServiceService {
  constructor(
    private servicesRepository: ServicesRepository,
    private commonServiceService: CommonServiceService,
  ) {}

  async execute({ id, organization_id }: IDeleteServiceService) {
    const service = await this.commonServiceService.getService({
      id,
      relations: ['costs'],
      organization_id,
    });

    if (service.costs.length > 0) {
      throw new AppError(serviceErrors.deleteWithCosts);
    }

    await this.servicesRepository.delete(service);
  }
}
