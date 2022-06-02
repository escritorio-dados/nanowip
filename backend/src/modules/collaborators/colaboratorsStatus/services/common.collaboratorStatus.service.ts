import { Injectable } from '@nestjs/common';
import { setDate, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { collaboratorStatusErrors } from '../errors/collaboratorStatus.errors';
import { CollaboratorsStatusRepository } from '../repositories/collaboratorStatus.repository';

type IGetCollaboratoStatus = { id: string; organization_id: string; relations?: string[] };

@Injectable()
export class CommonCollaboratorStatusService {
  constructor(private collaboratorStatusRepository: CollaboratorsStatusRepository) {}

  async getCollaboratorStatus({ id, organization_id }: IGetCollaboratoStatus) {
    const collaboratorStatus = await this.collaboratorStatusRepository.findById(id);

    if (!collaboratorStatus) {
      throw new AppError(collaboratorStatusErrors.notFound);
    }

    validateOrganization({ entity: collaboratorStatus, organization_id });

    return collaboratorStatus;
  }

  async validadeDate(date: Date, collaborator_id: string) {
    const status = await this.collaboratorStatusRepository.findByDateCollaborator(
      collaborator_id,
      date,
    );

    if (status) {
      throw new AppError(collaboratorStatusErrors.duplicateDate);
    }
  }

  fixDate(date: Date, gap?: number): Date {
    if (!date) {
      return date;
    }

    const day = gap ? 10 - gap : 10;

    const fixedHours = setHours(setMinutes(setSeconds(setMilliseconds(date, 0), 0), 0), 12);

    return setDate(fixedHours, day);
  }
}
