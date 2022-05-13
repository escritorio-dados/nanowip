import { Injectable } from '@nestjs/common';

import { Organization } from '../entities/Organization';
import { CommonOrganizationService } from './common.organization.service';

type IFindOneOrganizationService = { id: string };

@Injectable()
export class FindOneOrganizationService {
  constructor(private commonOrganizationService: CommonOrganizationService) {}

  async execute({ id }: IFindOneOrganizationService): Promise<Organization> {
    return this.commonOrganizationService.getOrganization({ id });
  }
}
