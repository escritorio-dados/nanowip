import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { collaboratorErrors } from '../errors/collaborator.errors';
import { CollaboratorsRepository } from '../repositories/collaborators.repository';
import { CommonCollaboratorService } from './common.collaborator.service';

type IDeleteCollaboratorService = { id: string; organization_id: string };

@Injectable()
export class DeleteCollaboratorService {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private commonCollaboratorService: CommonCollaboratorService,
  ) {}

  async execute({ id, organization_id }: IDeleteCollaboratorService) {
    const collaborator = await this.commonCollaboratorService.getCollaborator({
      id,
      relations: ['assignments', 'trackers'],
      organization_id,
    });

    if (collaborator.assignments.length > 0) {
      throw new AppError(collaboratorErrors.deleteWithAssignments);
    }

    if (collaborator.trackers.length > 0) {
      throw new AppError(collaboratorErrors.deleteWithTrackers);
    }

    await this.collaboratorsRepository.delete(collaborator);
  }
}
