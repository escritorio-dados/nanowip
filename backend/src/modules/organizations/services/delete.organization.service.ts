import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { Organization } from '../entities/Organization';
import { organizationErrors } from '../errors/organization.errors';
import { OrganizationsRepository } from '../repositories/organizations.repository';
import { DEFAULT_ORGANIZATION_IDS } from '../seeds/organizations.seeds';
import { CommonOrganizationService } from './common.organization.service';

type IDeleteOrganizationService = { id: string };

@Injectable()
export class DeleteOrganizationService {
  constructor(
    private organizationsRepository: OrganizationsRepository,
    private commonOrganizationService: CommonOrganizationService,
  ) {}

  async execute({ id }: IDeleteOrganizationService): Promise<Organization> {
    const rootOrganizationsIDs = Object.values(DEFAULT_ORGANIZATION_IDS);

    if (rootOrganizationsIDs.includes(id)) {
      throw new AppError(organizationErrors.deleteRoot);
    }

    const organization = await this.commonOrganizationService.getOrganization({
      id,
      relations: ['users'],
    });

    if (organization.users.length > 0) {
      throw new AppError(organizationErrors.organizationWithUsers);
    }

    const deleted = await this.organizationsRepository.delete(organization);

    return { ...deleted, id };
  }
}
