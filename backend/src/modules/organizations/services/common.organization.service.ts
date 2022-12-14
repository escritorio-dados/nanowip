import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { organizationErrors } from '../errors/organization.errors';
import { OrganizationsRepository } from '../repositories/organizations.repository';

type IGetOrganizationProps = { id: string; relations?: string[] };

type IValidateName = { name: string };

@Injectable()
export class CommonOrganizationService {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async validadeName({ name }: IValidateName) {
    const organization = await this.organizationsRepository.findByName({
      name: name.trim(),
    });

    if (organization) {
      throw new AppError(organizationErrors.duplicateName);
    }
  }

  async getOrganization({ id, relations }: IGetOrganizationProps) {
    const organization = await this.organizationsRepository.findById({ id, relations });

    if (!organization) {
      throw new AppError(organizationErrors.notFound);
    }

    return organization;
  }
}
