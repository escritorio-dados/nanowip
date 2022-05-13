import { Injectable } from '@nestjs/common';

import { CollaboratorsStatusRepository } from '../repositories/collaboratorStatus.repository';
import { CommonCollaboratorStatusService } from './common.collaboratorStatus.service';

type IDeleteCollaboratorStatusService = { id: string; organization_id: string };

@Injectable()
export class DeleteCollaboratorStatusService {
  constructor(
    private collaboratorsStatusRepository: CollaboratorsStatusRepository,
    private commonCollaboratorStatusService: CommonCollaboratorStatusService,
  ) {}

  async execute({ id, organization_id }: IDeleteCollaboratorStatusService) {
    const collaboratorStatus = await this.commonCollaboratorStatusService.getCollaboratorStatus({
      id,
      organization_id,
    });

    await this.collaboratorsStatusRepository.delete(collaboratorStatus);
  }
}
