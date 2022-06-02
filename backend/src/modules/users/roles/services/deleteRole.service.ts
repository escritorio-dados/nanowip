import { Injectable } from '@nestjs/common';

import { RolesRepository } from '../repositories/roles.repository';
import { CommonRoleService } from './commonRole.service';

type IDeleteRoleService = { id: string; organization_id: string };

@Injectable()
export class DeleteRoleService {
  constructor(
    private rolesRepository: RolesRepository,
    private commonRoleService: CommonRoleService,
  ) {}

  async execute({ id, organization_id }: IDeleteRoleService) {
    const role = await this.commonRoleService.getRole({ id, organization_id });

    await this.rolesRepository.delete(role);
  }
}
