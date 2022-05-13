import { Injectable } from '@nestjs/common';

import { fixPermissions } from '@modules/users/utils/fixPermissions';

import { RoleDto } from '../dtos/role.dto';
import { Role } from '../entities/Role';
import { RolesRepository } from '../repositories/roles.repository';
import { CommonRoleService } from './commonRole.service';

type ICreateRoleService = RoleDto & { organization_id: string };

@Injectable()
export class CreateRoleService {
  constructor(
    private rolesRepository: RolesRepository,
    private commonRoleService: CommonRoleService,
  ) {}

  async execute({ name, permissions, organization_id }: ICreateRoleService): Promise<Role> {
    await this.commonRoleService.validadeName({ name, organization_id });

    const fixedPermissions = fixPermissions(permissions);

    const role = await this.rolesRepository.create({
      name: name.trim(),
      permissions: fixedPermissions,
      organization_id,
    });

    return role;
  }
}
