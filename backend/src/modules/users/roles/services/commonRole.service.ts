import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { roleErrors } from '../errors/role.errors';
import { RolesRepository } from '../repositories/roles.repository';

type IValidateName = { name: string; organization_id: string };
type IGetById = { id: string; organization_id: string };

@Injectable()
export class CommonRoleService {
  constructor(private rolesRepository: RolesRepository) {}

  async validadeName({ name, organization_id }: IValidateName) {
    const roleWithSameName = await this.rolesRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (roleWithSameName) {
      throw new AppError(roleErrors.duplicateName);
    }
  }

  async getRole({ id, organization_id }: IGetById) {
    const role = await this.rolesRepository.findById(id);

    if (!role) {
      throw new AppError(roleErrors.notFound);
    }

    validateOrganization({ entity: role, organization_id });

    return role;
  }
}
