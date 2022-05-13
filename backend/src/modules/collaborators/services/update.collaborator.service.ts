import { Injectable } from '@nestjs/common';

import { FindOneUserService } from '@modules/users/services/findOneUser.service';

import { CollaboratorDto } from '../dtos/collaborator.dto';
import { CollaboratorsRepository } from '../repositories/collaborators.repository';
import { CommonCollaboratorService } from './common.collaborator.service';

type IUpdateCollaboratorService = CollaboratorDto & { id: string; organization_id: string };

@Injectable()
export class UpdateCollaboratorService {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private commonCollaboratorService: CommonCollaboratorService,
    private findOneUserService: FindOneUserService,
  ) {}

  async execute({
    user_id,
    id,
    organization_id,
    jobTitle,
    name,
    type,
  }: IUpdateCollaboratorService) {
    const collaborator = await this.commonCollaboratorService.getCollaborator({
      id,
      organization_id,
    });

    if (user_id && user_id !== collaborator.user_id) {
      const user = await this.findOneUserService.execute({ id: user_id, organization_id });

      await this.commonCollaboratorService.validadeUserId(user_id);

      collaborator.user = user;
      collaborator.user_id = user_id;
    } else if (!user_id) {
      collaborator.user_id = null;
    }

    if (name.trim().toLowerCase() !== collaborator.name.toLowerCase()) {
      await this.commonCollaboratorService.validadeName({ name, organization_id });
    }

    collaborator.name = name.trim();

    collaborator.jobTitle = jobTitle;

    collaborator.type = type;

    await this.collaboratorsRepository.save(collaborator);

    return collaborator;
  }
}
