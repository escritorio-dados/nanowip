import { Injectable } from '@nestjs/common';

import { OrganizationDto } from '../dtos/organization.dto';
import { Organization } from '../entities/Organization';
import { OrganizationsRepository } from '../repositories/organizations.repository';
import { CommonOrganizationService } from './common.organization.service';

@Injectable()
export class CreateOrganizationService {
  constructor(
    private organizationsRepository: OrganizationsRepository,
    private commonOrganizationService: CommonOrganizationService,
  ) {}

  async execute({ name }: OrganizationDto): Promise<Organization> {
    await this.commonOrganizationService.validadeName({ name });

    const organization = await this.organizationsRepository.create({
      name: name.trim(),
    });

    return organization;
  }
}
