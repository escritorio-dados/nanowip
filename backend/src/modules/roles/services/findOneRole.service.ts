import { Injectable } from '@nestjs/common';

import { Role } from '../entities/Role';
import { CommonRoleService } from './commonRole.service';

type IFindOneRoleService = { id: string; organization_id: string };

@Injectable()
export class FindOneRoleService {
  constructor(private commonRoleService: CommonRoleService) {}

  async execute({ id, organization_id }: IFindOneRoleService): Promise<Role> {
    return this.commonRoleService.getRole({ id, organization_id });
  }
}
