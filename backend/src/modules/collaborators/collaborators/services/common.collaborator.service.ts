import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { DEFAULT_USER_ID } from '@modules/users/users/seeds/users.seeds';

import { Collaborator } from '../entities/Collaborator';
import { collaboratorErrors } from '../errors/collaborator.errors';
import { CollaboratorsRepository } from '../repositories/collaborators.repository';

type IGetCollaborator = { id: string; organization_id: string; relations?: string[] };

type IValidateName = { name: string; organization_id: string };

type IValidateCollaborator = { collaborator: Collaborator; organization_id: string };

@Injectable()
export class CommonCollaboratorService {
  constructor(private collaboratorsRepository: CollaboratorsRepository) {}

  async validadeName({ name, organization_id }: IValidateName) {
    const collaborator = await this.collaboratorsRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (collaborator) {
      throw new AppError(collaboratorErrors.duplicateName);
    }
  }

  async getCollaborator({ id, organization_id, relations }: IGetCollaborator) {
    const collaborator = await this.collaboratorsRepository.findById(id, relations);

    this.validateCollaborator({ collaborator, organization_id });

    return collaborator;
  }

  validateCollaborator({ collaborator, organization_id }: IValidateCollaborator) {
    if (!collaborator) {
      throw new AppError(collaboratorErrors.notFound);
    }

    validateOrganization({ entity: collaborator, organization_id });
  }

  async validadeUserId(user_id: string) {
    if (user_id === DEFAULT_USER_ID) {
      throw new AppError(collaboratorErrors.collaboratorRootUser);
    }

    const collaboratorWithSameUser = await this.collaboratorsRepository.findByUserId(user_id);

    if (collaboratorWithSameUser) {
      throw new AppError(collaboratorErrors.userUsebByAnotherCollaborator);
    }
  }
}
