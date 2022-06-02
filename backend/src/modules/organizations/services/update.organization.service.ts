import { Injectable } from '@nestjs/common';

import { OrganizationDto } from '../dtos/organization.dto';
import { OrganizationsRepository } from '../repositories/organizations.repository';
import { CommonOrganizationService } from './common.organization.service';

type IUpdateOrganizationService = OrganizationDto & { id: string };

@Injectable()
export class UpdateOrganizationService {
  constructor(
    private organizationsRepository: OrganizationsRepository,
    private commonOrganizationService: CommonOrganizationService,
  ) {}

  async execute({ id, name }: IUpdateOrganizationService) {
    const organization = await this.commonOrganizationService.getOrganization({
      id,
    });

    if (organization.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonOrganizationService.validadeName({ name });
    }

    organization.name = name.trim();

    await this.organizationsRepository.save(organization);

    return organization;
  }
}
