import { Injectable } from '@nestjs/common';

import { FindOneCollaboratorService } from '@modules/collaborators/services/findOne.collaborator.service';
import { Task } from '@modules/tasks/tasks/entities/Task';
import { FindOneTaskService } from '@modules/tasks/tasks/services/findOne.task.service';
import { FixDatesTaskService } from '@modules/tasks/tasks/services/fixDates.task.service';

import { ICreateAssignmentRepositoryDto } from '../dtos/create.assignment.repository.dto';
import { CreateAssignmentDto } from '../dtos/createAssignment.dto';
import { StatusAssignment } from '../enums/status.assignment.enum';
import { AssignmentsRepository } from '../repositories/assignments.repository';
import { CommonAssignmentService } from './common.assignment.service';

type ICreateAssignmentService = CreateAssignmentDto & { organization_id: string };

type IResolveTask = { task_id: string; organization_id: string; status: StatusAssignment };

@Injectable()
export class CreateAssignmentService {
  constructor(
    private assignmentsRepository: AssignmentsRepository,
    private commonAssignmentService: CommonAssignmentService,

    private findOneCollaboratorService: FindOneCollaboratorService,
    private findOneTaskService: FindOneTaskService,
    private fixDatesTaskService: FixDatesTaskService,
  ) {}

  private async resolveTask({ organization_id, status, task_id }: IResolveTask): Promise<Task> {
    // Impedir de criar atribuições abertas em tarefas já finalizadas
    const task = await this.findOneTaskService.execute({ id: task_id, organization_id });

    if (status === StatusAssignment.open) {
      await this.commonAssignmentService.validateOpenAssignment({
        task_id: task.id,
        organization_id,
      });
    }

    return task;
  }

  async execute({
    collaborator_id,
    task_id,
    status,
    organization_id,
    timeLimit,
  }: ICreateAssignmentService) {
    const newAssignment: ICreateAssignmentRepositoryDto = {
      organization_id,
      timeLimit,
    } as ICreateAssignmentRepositoryDto;

    // Validando se não é duplicata
    await this.commonAssignmentService.validateAssignmentDuplicate(task_id, collaborator_id);

    // Atribuindo o status
    newAssignment.status = status;

    // Validando e atribuindo o colaborador
    newAssignment.collaborator = await this.findOneCollaboratorService.execute({
      id: collaborator_id,
      organization_id,
    });

    // Validando e atribuindo a tarefa
    newAssignment.task = await this.resolveTask({ task_id, status, organization_id });

    // Salvando no banco de dados a atribuição
    const assignment = await this.assignmentsRepository.create(newAssignment);

    // Causando os efeitos colaterais na tarefa
    if (status === StatusAssignment.open) {
      await this.fixDatesTaskService.verifyDatesChanges({
        task_id: assignment.task_id,
        end: { new: null },
      });
    }

    return assignment;
  }
}
