import { Injectable } from '@nestjs/common';

import { FindOneCollaboratorService } from '@modules/collaborators/services/findOne.collaborator.service';

import { CollaboratorStatusDto } from '../dtos/collaboratorStatus.dto';
import { ICreateCollaboratorStatusRepositoryDto } from '../dtos/create.collaboratorStatus.repository.dto';
import { CollaboratorsStatusRepository } from '../repositories/collaboratorStatus.repository';
import { CommonCollaboratorStatusService } from './common.collaboratorStatus.service';

type ICreateCollaboratorStatusService = CollaboratorStatusDto & { organization_id: string };

@Injectable()
export class CreateCollaboratorStatusService {
  constructor(
    private collaboratorsStatusRepository: CollaboratorsStatusRepository,
    private commonCollaboratorStatusService: CommonCollaboratorStatusService,

    private findOneCollaboratorService: FindOneCollaboratorService,
  ) {}

  async execute({
    collaborator_id,
    date,
    monthHours,
    salary,
    organization_id,
  }: ICreateCollaboratorStatusService) {
    const collaboratorStatusToCreate = {
      organization_id,
      monthHours,
      salary,
    } as ICreateCollaboratorStatusRepositoryDto;

    collaboratorStatusToCreate.collaborator = await this.findOneCollaboratorService.execute({
      id: collaborator_id,
      organization_id,
    });

    // Fixando uma data qualquer do mes, já que só importa o mes e ano
    const fixedDate = this.commonCollaboratorStatusService.fixDate(date);

    await this.commonCollaboratorStatusService.validadeDate(fixedDate, collaborator_id);

    collaboratorStatusToCreate.date = fixedDate;

    const collaboratorStatus = await this.collaboratorsStatusRepository.create(
      collaboratorStatusToCreate,
    );

    return collaboratorStatus;
  }
}
