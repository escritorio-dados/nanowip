import { Injectable } from '@nestjs/common';
import { differenceInHours, isAfter, isBefore, isEqual, max, subSeconds } from 'date-fns';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { FindOneAssignmentService } from '@modules/assignments/services/findOne.assignment.service';
import { FindOneTaskService } from '@modules/tasks/services/findOne.task.service';
import { User } from '@modules/users/entities/User';
import { PermissionsUser } from '@modules/users/enums/permissionsUser.enum';

import { Tracker } from '../entities/Tracker';
import { trackerErrors } from '../errors/tracker.errors';
import { TrackersRepository } from '../repositories/trackers.repository';

type IValidadeOnSamePeriodParams = {
  collaborator_id: string;
  tracker_id?: string;
  start: Date;
  end: Date;
};

type IResolveAssignmentParams = {
  assignment_id: string;
  start: Date;
  collaborator_id: string;
  organization_id: string;
};

type ICloseOpenAssignmentParams = { collaborator_id: string; start: Date };

type IGetTracker = { id: string; organization_id: string; relations?: string[] };

type IValidateTracker = { tracker: Tracker; organization_id: string };

type ICheckPersonalAccess = { user: User; collaborator_id?: string; extraPermission: string };

@Injectable()
export class CommonTrackerService {
  constructor(
    private trackersRepository: TrackersRepository,
    private findOneAssignmentService: FindOneAssignmentService,
    private findOneTaskService: FindOneTaskService,
  ) {}

  async getTracker({ id, organization_id, relations }: IGetTracker) {
    const tracker = await this.trackersRepository.findById(id, relations);

    this.validateTracker({ tracker, organization_id });

    return tracker;
  }

  validateTracker({ tracker, organization_id }: IValidateTracker) {
    if (!tracker) {
      throw new AppError(trackerErrors.notFound);
    }

    validateOrganization({ entity: tracker, organization_id });
  }

  checkPersonalAccess({ extraPermission, user, collaborator_id }: ICheckPersonalAccess) {
    if (user) {
      const adminPermissions = {
        [extraPermission]: true,
        [PermissionsUser.admin]: true,
        [PermissionsUser.manage_tracker]: true,
      };

      const hasAdminPermissions = user.permissions.some(permission => adminPermissions[permission]);

      if (!hasAdminPermissions) {
        if (user.collaborator.id !== collaborator_id) {
          throw new AppError(trackerErrors.differentCollaboratorsTrackerUser);
        }

        return true;
      }
    }

    return false;
  }

  async getLastTracker(collaborator_id: string) {
    // Pegando todos os trackers das ultimas 24h
    const trackers = await this.trackersRepository.findAllCollaboratorDateRelative({
      collaborator_id,
      date: new Date(),
      hoursBefore: 24,
    });

    // Filtrando somente os trackers que possuem fim
    const trackerWithEnd = trackers.filter(tracker => tracker.end);

    if (trackerWithEnd.length === 0) {
      return null;
    }

    // Pegando a maior data de fim entre eles
    const maxEnd = max(trackerWithEnd.map(({ end }) => end));

    const lastTracker = trackerWithEnd.find(tracker => isEqual(tracker.end, maxEnd));

    return lastTracker;
  }

  async closeOpenTracker({ collaborator_id, start }: ICloseOpenAssignmentParams) {
    // Busca tracker aberto do colaborador
    const trackerOpen = await this.trackersRepository.findOpen(collaborator_id);

    // Se não tiver nenhum tracker aberto cancela a função
    if (!trackerOpen) {
      return;
    }

    // Validando o tempo limite do tracker
    this.validateTrackerTimeLimit(trackerOpen.start, start);

    // Validação se o novo tracker é posterior ao tracker aberto
    if (isAfter(trackerOpen.start, start)) {
      throw new AppError(trackerErrors.closeTrackerAfterNewTracker);
    }

    // Atribuindo a data de inicio do novo tracker como o fim do aberto
    const endDate = subSeconds(start, 1);

    trackerOpen.end = endDate;

    // Salvando a alteração
    await this.trackersRepository.save(trackerOpen);
  }

  validateTrackerTimeLimit(start: Date, end: Date) {
    const differenceDates = differenceInHours(end, start);

    if (differenceDates >= 12) {
      throw new AppError(trackerErrors.timeLimit);
    }
  }

  async validadeDateOnSamePeriod({
    collaborator_id,
    end,
    start,
    tracker_id,
  }: IValidadeOnSamePeriodParams) {
    const trackerOnSamePeriod = await this.trackersRepository.findOnSamePeriod({
      collaborator_id,
      end,
      start,
    });

    if (trackerOnSamePeriod && trackerOnSamePeriod.id !== tracker_id) {
      throw new AppError(trackerErrors.trackersOnSamePeriod);
    }
  }

  async resolveAssingment({
    assignment_id,
    collaborator_id,
    start,
    organization_id,
  }: IResolveAssignmentParams) {
    const assignment = await this.findOneAssignmentService.execute({
      id: assignment_id,
      organization_id,
    });

    // Validando se o tracker o assignment possuem o mesmo collaborador
    if (assignment.collaborator_id !== collaborator_id) {
      throw new AppError(trackerErrors.differentCollaboratorsTrackerAssignment);
    }

    // Validando se a Tarafa já está disponivel na data atual
    const task = await this.findOneTaskService.execute({
      id: assignment.task_id,
      organization_id,
    });

    if (!task.availableDate || isBefore(start, task.availableDate)) {
      throw new AppError(trackerErrors.taskNotAvailable);
    }

    return assignment;
  }
}
