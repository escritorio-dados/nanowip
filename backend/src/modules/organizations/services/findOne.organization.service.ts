import { Injectable } from '@nestjs/common';

import { CommonOrganizationService } from './common.organization.service';

type IFindOneOrganizationService = { id: string };

@Injectable()
export class FindOneOrganizationService {
  constructor(private commonOrganizationService: CommonOrganizationService) {}

  async execute({ id }: IFindOneOrganizationService) {
    return this.commonOrganizationService.getOrganization({ id });
  }
}
