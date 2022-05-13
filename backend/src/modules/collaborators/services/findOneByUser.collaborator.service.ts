import { Injectable } from '@nestjs/common';

import { validateOrganization } from '@shared/utils/validateOrganization';

import { Collaborator } from '@modules/collaborators/entities/Collaborator';
import { CollaboratorsRepository } from '@modules/collaborators/repositories/collaborators.repository';

type IFindOneByUserCollaboratorService = { user_id: string; organization_id: string };

@Injectable()
export class FindOneByUserCollaboratorService {
  constructor(private collaboratorsRepository: CollaboratorsRepository) {}

  async execute({
    user_id,
    organization_id,
  }: IFindOneByUserCollaboratorService): Promise<Collaborator> {
    const collaborator = await this.collaboratorsRepository.findByUserId(user_id);

    if (collaborator) {
      validateOrganization({ entity: collaborator, organization_id });
    }

    return collaborator;
  }
}
