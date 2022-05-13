import { Injectable } from '@nestjs/common';
import { differenceInSeconds } from 'date-fns';

import { AppError } from '@shared/errors/AppError';
import { getParentPath, getParentPathString } from '@shared/utils/getParentPath';

import { User } from '@modules/users/entities/User';
import { PermissionsUser } from '@modules/users/enums/permissionsUser.enum';

import { trackerErrors } from '../errors/tracker.errors';
import { TrackersRepository } from '../repositories/trackers.repository';
import { CommonTrackerService } from './common.tracker.service';

type IFindOneTrackerService = { id: string; organization_id: string; user: User };

@Injectable()
export class FindOneTrackerService {
  constructor(
    private commonTrackerService: CommonTrackerService,
    private trackersRepository: TrackersRepository,
  ) {}

  async getActive(user: User) {
    if (!user.collaborator) {
      return undefined;
    }

    const tracker = await this.trackersRepository.findActive(user.collaborator.id);

    if (!tracker) {
      return undefined;
    }

    const duration = tracker.assignment
      ? tracker.assignment.trackers.reduce((total, trackerAssignmnet) => {
          return (
            total +
            differenceInSeconds(trackerAssignmnet.end || new Date(), trackerAssignmnet.start)
          );
        }, 0)
      : differenceInSeconds(tracker.end || new Date(), tracker.start);

    const pathString = tracker.assignment
      ? getParentPathString({
          entity: tracker.assignment.task,
          getCustomer: true,
          entityType: 'task',
          skipFirstName: false,
        })
      : undefined;

    const path = tracker.assignment
      ? getParentPath({
          entity: tracker.assignment.task,
          getCustomer: true,
          entityType: 'task',
          includeEntity: true,
        })
      : undefined;

    return {
      ...tracker,
      assignment_id: tracker.assignment?.id,
      deadline: tracker.assignment?.task.deadline,
      description: tracker.assignment?.task.description,
      link: tracker.assignment?.task.link,
      duration,
      timeLimit: tracker.assignment?.timeLimit,
      path,
      pathString,
      assignment: undefined,
      start: undefined,
      end: undefined,
    };
  }

  async getInfo({ id, organization_id, user }: IFindOneTrackerService) {
    const tracker = await this.trackersRepository.getInfo(id);

    this.commonTrackerService.validateTracker({ tracker, organization_id });

    // Validando caso seja o proprio colaborador que esteja preenchendo o tracker, que o id dele seja igual ao fornecido
    if (user) {
      const adminPermissions = {
        [PermissionsUser.read_tracker]: true,
        [PermissionsUser.admin]: true,
        [PermissionsUser.manage_tracker]: true,
      };

      const hasAdminPermissions = user.permissions.some(permission => adminPermissions[permission]);

      if (!hasAdminPermissions) {
        if (user.collaborator.id !== tracker.collaborator_id) {
          throw new AppError(trackerErrors.personalAccessAnotherUser);
        }
      }
    }

    const path = tracker.assignment_id
      ? getParentPath({
          entity: tracker.assignment.task,
          getCustomer: true,
          entityType: 'task',
          includeEntity: true,
        })
      : undefined;

    return {
      ...tracker,
      path,
      assignment: undefined,
    };
  }

  async execute({ id, organization_id, user }: IFindOneTrackerService) {
    const tracker = await this.commonTrackerService.getTracker({ id, organization_id });

    // Validando caso seja o proprio colaborador que esteja preenchendo o tracker, que o id dele seja igual ao fornecido
    if (user) {
      const adminPermissions = {
        [PermissionsUser.read_tracker]: true,
        [PermissionsUser.admin]: true,
        [PermissionsUser.manage_tracker]: true,
      };

      const hasAdminPermissions = user.permissions.some(permission => adminPermissions[permission]);

      if (!hasAdminPermissions) {
        if (user.collaborator.id !== tracker.collaborator_id) {
          throw new AppError(trackerErrors.personalAccessAnotherUser);
        }
      }
    }

    return tracker;
  }
}
