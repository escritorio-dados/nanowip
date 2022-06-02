import { Injectable } from '@nestjs/common';
import { isEqual } from 'date-fns';

import { FindOneCollaboratorService } from '@modules/collaborators/collaborators/services/findOne.collaborator.service';

import { CollaboratorStatusDto } from '../dtos/collaboratorStatus.dto';
import { CollaboratorsStatusRepository } from '../repositories/collaboratorStatus.repository';
import { CommonCollaboratorStatusService } from './common.collaboratorStatus.service';

type IUpdateCollaboratorStatusService = CollaboratorStatusDto & {
  id: string;
  organization_id: string;
};

@Injectable()
export class UpdateCollaboratorStatusService {
  constructor(
    private collaboratorsStatusRepository: CollaboratorsStatusRepository,
    private commonCollaboratorStatusService: CommonCollaboratorStatusService,

    private findOneCollaboratorService: FindOneCollaboratorService,
  ) {}

  async execute({
    date,
    id,
    monthHours,
    organization_id,
    salary,
    collaborator_id,
  }: IUpdateCollaboratorStatusService) {
    const collaboratorStatus = await this.commonCollaboratorStatusService.getCollaboratorStatus({
      id,
      organization_id,
    });

    const fixedDate = this.commonCollaboratorStatusService.fixDate(date);

    if (!isEqual(fixedDate, collaboratorStatus.date)) {
      await this.commonCollaboratorStatusService.validadeDate(
        fixedDate,
        collaboratorStatus.collaborator_id,
      );

      collaboratorStatus.date = fixedDate;
    }

    if (collaborator_id !== collaboratorStatus.collaborator_id) {
      collaboratorStatus.collaborator = await this.findOneCollaboratorService.execute({
        id: collaborator_id,
        organization_id,
      });

      collaboratorStatus.collaborator_id = collaborator_id;
    }

    collaboratorStatus.salary = salary;

    collaboratorStatus.monthHours = monthHours;

    await this.collaboratorsStatusRepository.save(collaboratorStatus);

    return collaboratorStatus;
  }
}
