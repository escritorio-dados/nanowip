import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { FindOneTaskService } from '@modules/tasks/tasks/services/findOne.task.service';

import { Assignment } from '../entities/Assignment';
import { assignmentErrors } from '../errors/assignment.errors';
import { AssignmentsRepository } from '../repositories/assignments.repository';

type IGetAssignment = { id: string; organization_id: string; relations?: string[] };
type IValidateAssignment = { assignment: Assignment; organization_id: string };
type IValidateOpenAssignment = { task_id: string; organization_id: string };

@Injectable()
export class CommonAssignmentService {
  constructor(
    private assignmentsRepository: AssignmentsRepository,
    private findOneTaskService: FindOneTaskService,
  ) {}

  async getAssignment({ id, organization_id, relations }: IGetAssignment) {
    const assignment = await this.assignmentsRepository.findById(id, relations);

    this.validateAssignment({ assignment, organization_id });

    return assignment;
  }

  validateAssignment({ assignment, organization_id }: IValidateAssignment) {
    if (!assignment) {
      throw new AppError(assignmentErrors.notFound);
    }

    validateOrganization({ entity: assignment, organization_id });
  }

  async validateAssignmentDuplicate(task_id: string, collaborator_id: string) {
    const assignment = await this.assignmentsRepository.findDuplicate(task_id, collaborator_id);

    if (assignment) {
      throw new AppError(assignmentErrors.duplicateAssignment);
    }
  }

  async validateOpenAssignment({ task_id, organization_id }: IValidateOpenAssignment) {
    // Validando se alguma tarefa dependente iniciou
    const task = await this.findOneTaskService.execute({
      id: task_id,
      relations: ['nextTasks'],
      organization_id,
    });

    // Se a tarefa não for finalizada não necessida de validação de dependencias
    if (!task.endDate) {
      return;
    }

    if (task.nextTasks.length >= 1) {
      const someTaskDependentsStarted = task.nextTasks.some(({ startDate }) => !!startDate);

      if (someTaskDependentsStarted) {
        throw new AppError(assignmentErrors.openAssignmentInCloseTask);
      }
    }
  }
}
