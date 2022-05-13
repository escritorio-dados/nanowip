import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { getParentPath } from '@shared/utils/getParentPath';

import { User } from '@modules/users/entities/User';
import { PermissionsUser } from '@modules/users/enums/permissionsUser.enum';

import { assignmentErrors } from '../errors/assignment.errors';
import { AssignmentsRepository } from '../repositories/assignments.repository';
import { CommonAssignmentService } from './common.assignment.service';

type IFindOneAssignmentService = { id: string; organization_id: string; user?: User };

@Injectable()
export class FindOneAssignmentService {
  constructor(
    private commonAssignmentService: CommonAssignmentService,
    private assignmentsRepository: AssignmentsRepository,
  ) {}

  async getInfo({ id, organization_id, user }: IFindOneAssignmentService) {
    const assignment = await this.assignmentsRepository.getInfo(id);

    this.commonAssignmentService.validateAssignment({ assignment, organization_id });

    // Validando que o acesso está sendo feito poelo proprio usuario ou por um admin
    if (user) {
      const adminPermissions = {
        [PermissionsUser.read_assignment]: true,
        [PermissionsUser.admin]: true,
        [PermissionsUser.manage_assignment]: true,
      };

      const hasAdminPermissions = user.permissions.some(permission => adminPermissions[permission]);

      if (!hasAdminPermissions) {
        if (user.collaborator.id !== assignment.collaborator_id) {
          throw new AppError(assignmentErrors.personalAccessAnotherUser);
        }
      }
    }

    const trackerInProgress = assignment.trackers.find(tracker => !tracker.end);

    return {
      ...assignment,
      inProgress: !!trackerInProgress,
      trackerInProgress,
      path: getParentPath({
        entity: assignment.task,
        entityType: 'task',
        getCustomer: true,
        includeEntity: true,
      }),
      task: undefined,
      trackers: undefined,
    };
  }

  async execute({ id, organization_id, user }: IFindOneAssignmentService) {
    const assignment = await this.commonAssignmentService.getAssignment({ id, organization_id });

    // Validando que o acesso está sendo feito poelo proprio usuario ou por um admin
    if (user) {
      const adminPermissions = {
        [PermissionsUser.read_assignment]: true,
        [PermissionsUser.admin]: true,
        [PermissionsUser.manage_assignment]: true,
      };

      const hasAdminPermissions = user.permissions.some(permission => adminPermissions[permission]);

      if (!hasAdminPermissions) {
        if (user.collaborator.id !== assignment.collaborator_id) {
          throw new AppError(assignmentErrors.personalAccessAnotherUser);
        }
      }
    }

    return assignment;
  }
}
