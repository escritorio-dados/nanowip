import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { StatusAssignment } from '@modules/assignments/enums/status.assignment.enum';
import { FixDatesAssignmentService } from '@modules/assignments/services/fixDates.assignment.service';
import { User } from '@modules/users/entities/User';
import { PermissionsUser } from '@modules/users/enums/permissionsUser.enum';

import { Tracker } from '../entities/Tracker';
import { trackerErrors } from '../errors/tracker.errors';
import { TrackersRepository } from '../repositories/trackers.repository';
import { CommonTrackerService } from './common.tracker.service';

type IDeleteTrackerService = { id: string; organization_id: string; user?: User };

@Injectable()
export class DeleteTrackerService {
  constructor(
    private commonTrackerService: CommonTrackerService,
    private trackersRepository: TrackersRepository,

    private fixDatesAssignmentService: FixDatesAssignmentService,
  ) {}

  async execute({ id, organization_id, user }: IDeleteTrackerService): Promise<Tracker> {
    // Pegando o tracker que será deletado
    const tracker = await this.commonTrackerService.getTracker({
      id,
      relations: ['assignment'],
      organization_id,
    });

    // Validando se é um acesso pessoal
    this.commonTrackerService.checkPersonalAccess({
      extraPermission: PermissionsUser.delete_tracker,
      user,
      collaborator_id: tracker.collaborator_id,
    });

    // Validando se a atribuição está fechada
    if (tracker.assignment && tracker.assignment.status === StatusAssignment.close) {
      throw new AppError(trackerErrors.deleteInCloseAssignment);
    }

    // Deletando o tracker
    const deleted = await this.trackersRepository.delete(tracker);

    // Causando os efeitos colaterais na atribuição
    await this.fixDatesAssignmentService.verifyRecalculateDates({
      assignment_id: deleted.assignment_id,
      changedStartDate: deleted.start,
      changedEndDate: deleted.end,
    });

    return { ...deleted, id };
  }
}
