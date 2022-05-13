import { Injectable } from '@nestjs/common';
import { differenceInHours } from 'date-fns';

import { AppError } from '@shared/errors/AppError';

import { FixDatesTaskService } from '@modules/tasks/services/fixDates.task.service';
import { TrackersRepository } from '@modules/trackers/repositories/trackers.repository';
import { User } from '@modules/users/entities/User';

import { ChangeStatusAssignmentDto } from '../dtos/changeStatus.assignment.dto';
import { UpdateAssignmentDto } from '../dtos/updateAssignment.dto';
import { Assignment } from '../entities/Assignment';
import { StatusAssignment } from '../enums/status.assignment.enum';
import { assignmentErrors } from '../errors/assignment.errors';
import { AssignmentsRepository } from '../repositories/assignments.repository';
import { CommonAssignmentService } from './common.assignment.service';

type IChangeStatus = { assignment: Assignment; status: StatusAssignment; organization_id: string };

type IUpdateAssignmentService = UpdateAssignmentDto & { id: string; organization_id: string };

type IPersonalChangeStatus = ChangeStatusAssignmentDto & {
  id: string;
  organization_id: string;
  user: User;
};

@Injectable()
export class UpdateAssignmentService {
  constructor(
    private assignmentsRepository: AssignmentsRepository,
    private commonAssignmentService: CommonAssignmentService,
    private fixDatesTaskService: FixDatesTaskService,

    private trackersRepository: TrackersRepository,
  ) {}

  async changeStatus({ assignment, organization_id, status }: IChangeStatus) {
    const assignmentUpdated = { ...assignment };

    // Sem alterações
    if (assignment.status === status) {
      return assignmentUpdated;
    }

    // Aberto -> Fechado
    if (status === StatusAssignment.close) {
      // Lidando com casos sem tracker
      if (assignment.trackers.length === 0) {
        throw new AppError(assignmentErrors.closeAssignmentWithoutTrackers);
      }

      // Lidando com trackers abertos
      const trackerOpen = assignment.trackers.find(tracker => !tracker.end);

      if (trackerOpen) {
        const differenceDates = differenceInHours(new Date(), trackerOpen.start);

        // Impedindo de fechar uma atribuição com tracker de duração superior a 12h
        if (differenceDates >= 12) {
          throw new AppError(assignmentErrors.closeAssignmentWithOpenTracker);
        }

        // Fechando o tracker aberto com a data atual
        trackerOpen.end = new Date();

        await this.trackersRepository.save(trackerOpen);

        // Atualizando a data de fim da atribuição
        assignmentUpdated.endDate = trackerOpen.end;
      }
    }

    // Fechado -> Aberto
    if (status === StatusAssignment.open) {
      // Validando se alguma tarefa dependente iniciou
      await this.commonAssignmentService.validateOpenAssignment({
        task_id: assignment.task_id,
        organization_id,
      });
    }

    // Alterando e salvando as alterações
    assignmentUpdated.status = status;

    return assignmentUpdated;
  }

  async personalChangeStatus({ id, status, organization_id, user }: IPersonalChangeStatus) {
    const assignment = await this.commonAssignmentService.getAssignment({
      id,
      relations: ['trackers', 'collaborator'],
      organization_id,
    });

    // Validando se é uma atribuição do usuario
    if (assignment.collaborator_id !== user.collaborator.id) {
      throw new AppError(assignmentErrors.changeStatusAssignmentFromAnotherUser);
    }

    // Atualizando o status
    const assignmentUpdated = await this.changeStatus({
      assignment,
      status,
      organization_id,
    });

    await this.assignmentsRepository.save(assignmentUpdated);

    // Causando os efeitos colaterais nas tarefas
    if (assignment.status !== assignmentUpdated.status) {
      // Status de aberto para fechado
      if (assignmentUpdated.status === StatusAssignment.close) {
        await this.fixDatesTaskService.verifyDatesChanges({
          task_id: assignmentUpdated.task_id,
          end: { new: assignmentUpdated.endDate },
        });
      }

      // Status de Fechado para Aberto
      else {
        await this.fixDatesTaskService.verifyDatesChanges({
          task_id: assignmentUpdated.task_id,
          end: { new: null },
        });
      }
    }

    return assignmentUpdated;
  }

  async execute({ id, status, organization_id, timeLimit }: IUpdateAssignmentService) {
    const assignment = await this.commonAssignmentService.getAssignment({
      id,
      relations: ['trackers', 'collaborator'],
      organization_id,
    });

    // Alterando Status
    const assignmentUpdated = await this.changeStatus({ assignment, status, organization_id });

    assignmentUpdated.timeLimit = timeLimit;

    // Salvando as alterações
    await this.assignmentsRepository.save(assignmentUpdated);

    // Causando os efeitos colaterais nas tarefas
    if (assignment.status !== assignmentUpdated.status) {
      // Status de aberto para fechado
      if (assignmentUpdated.status === StatusAssignment.close) {
        await this.fixDatesTaskService.verifyDatesChanges({
          task_id: assignmentUpdated.task_id,
          end: { new: assignmentUpdated.endDate },
        });
      }

      // Status de Fechado para Aberto
      else {
        await this.fixDatesTaskService.verifyDatesChanges({
          task_id: assignmentUpdated.task_id,
          end: { new: null },
        });
      }
    }

    return assignmentUpdated;
  }
}
