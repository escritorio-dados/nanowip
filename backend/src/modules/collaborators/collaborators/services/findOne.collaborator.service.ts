import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { User } from '@modules/users/users/entities/User';
import { PermissionsUser } from '@modules/users/users/enums/permissionsUser.enum';

import { collaboratorErrors } from '../errors/collaborator.errors';
import { CollaboratorsRepository } from '../repositories/collaborators.repository';
import { CommonCollaboratorService } from './common.collaborator.service';

type IFindOneCollaboratorService = { id: string; organization_id: string; user?: User };

@Injectable()
export class FindOneCollaboratorService {
  constructor(
    private commonCollaboratorService: CommonCollaboratorService,
    private collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async getInfo({ id, organization_id, user }: IFindOneCollaboratorService) {
    const collaborator = await this.collaboratorsRepository.getInfo(id);

    this.commonCollaboratorService.validateCollaborator({ collaborator, organization_id });

    if (user) {
      const adminPermissions = {
        [PermissionsUser.read_collaborator]: true,
        [PermissionsUser.admin]: true,
        [PermissionsUser.manage_collaborator]: true,
      };

      const hasAdminPermissions = user.permissions.some(permission => adminPermissions[permission]);

      if (!hasAdminPermissions) {
        if (user.collaborator.id !== collaborator.id) {
          throw new AppError(collaboratorErrors.personalAccessAnotherUser);
        }
      }
    }

    return collaborator;
  }

  async execute({ id, organization_id, user }: IFindOneCollaboratorService) {
    const collaborator = await this.commonCollaboratorService.getCollaborator({
      id,
      organization_id,
    });

    if (user) {
      const adminPermissions = {
        [PermissionsUser.read_collaborator]: true,
        [PermissionsUser.admin]: true,
        [PermissionsUser.manage_collaborator]: true,
      };

      const hasAdminPermissions = user.permissions.some(permission => adminPermissions[permission]);

      if (!hasAdminPermissions) {
        if (user.collaborator.id !== collaborator.id) {
          throw new AppError(collaboratorErrors.personalAccessAnotherUser);
        }
      }
    }

    return collaborator;
  }
}
