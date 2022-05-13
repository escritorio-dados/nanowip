import { Injectable } from '@nestjs/common';

import { fixPermissions } from '@modules/users/utils/fixPermissions';

import { RoleDto } from '../dtos/role.dto';
import { Role } from '../entities/Role';
import { RolesRepository } from '../repositories/roles.repository';
import { CommonRoleService } from './commonRole.service';

type IUpdateRoleService = RoleDto & { id: string; organization_id: string };

@Injectable()
export class UpdateRoleService {
  constructor(
    private rolesRepository: RolesRepository,
    private commonRoleService: CommonRoleService,
  ) {}

  async execute({ id, name, permissions, organization_id }: IUpdateRoleService): Promise<Role> {
    const role = await this.commonRoleService.getRole({ id, organization_id });

    if (role.name.toLowerCase() !== name.trim().toLowerCase()) {
      await this.commonRoleService.validadeName({ name, organization_id });
    }

    role.name = name.trim();

    role.permissions = fixPermissions(permissions);

    await this.rolesRepository.save(role);

    return role;
  }
}
