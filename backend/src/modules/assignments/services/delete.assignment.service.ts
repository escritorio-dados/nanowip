import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { FixDatesTaskService } from '@modules/tasks/tasks/services/fixDates.task.service';

import { assignmentErrors } from '../errors/assignment.errors';
import { AssignmentsRepository } from '../repositories/assignments.repository';
import { CommonAssignmentService } from './common.assignment.service';

type IDeleteAssignmentService = { id: string; organization_id: string };

type IDeleteMany = { ids: string[]; organization_id: string };

@Injectable()
export class DeleteAssignmentService {
  constructor(
    private assignmentsRepository: AssignmentsRepository,
    private commonAssignmentService: CommonAssignmentService,

    private fixDatesTaskService: FixDatesTaskService,
  ) {}

  async deleteMany({ ids, organization_id }: IDeleteMany) {
    const assignments = await this.assignmentsRepository.findAllByKey({
      ids,
      key: 'id',
      relations: ['trackers'],
      organization_id,
    });

    const someTracker = assignments.some(assignment => assignment.trackers.length > 0);

    if (someTracker) {
      throw new AppError(assignmentErrors.deleteWithTrackers);
    }

    await this.assignmentsRepository.deleteMany(assignments);

    // Não é possivel deletar atribuições com tracker então não existe impactos nas datas
  }

  async execute({ id, organization_id }: IDeleteAssignmentService) {
    const assignment = await this.commonAssignmentService.getAssignment({
      id,
      relations: ['trackers'],
      organization_id,
    });

    if (assignment.trackers.length > 0) {
      throw new AppError(assignmentErrors.deleteWithTrackers);
    }

    await this.assignmentsRepository.delete(assignment);

    // Arrumando possiveis alterações das datas fixas
    await this.fixDatesTaskService.verifyDatesChanges({
      task_id: assignment.task_id,
      deleted: !!assignment.endDate,
      start: { old: assignment.startDate },
    });
  }
}
