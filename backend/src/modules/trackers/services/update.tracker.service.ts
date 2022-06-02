import { Injectable } from '@nestjs/common';
import { isAfter, isBefore } from 'date-fns';

import { AppError } from '@shared/errors/AppError';
import { DatesController } from '@shared/utils/ServiceDatesController';
import { validateStartEndDate } from '@shared/utils/validadeDates';

import { Assignment } from '@modules/assignments/entities/Assignment';
import { StatusAssignment } from '@modules/assignments/enums/status.assignment.enum';
import { FixDatesAssignmentService } from '@modules/assignments/services/fixDates.assignment.service';
import { User } from '@modules/users/users/entities/User';
import { PermissionsUser } from '@modules/users/users/enums/permissionsUser.enum';

import { UpdateTrackerDto } from '../dtos/update.tracker.dto';
import { trackerErrors } from '../errors/tracker.errors';
import { TrackersRepository } from '../repositories/trackers.repository';
import { CommonTrackerService } from './common.tracker.service';

type IValidadeCloseAssignmentParams = { assignment: Assignment; endDate: Date | null };

type IUpdateTrackerService = UpdateTrackerDto & {
  id: string;
  organization_id: string;
  user?: User;
};

@Injectable()
export class UpdateTrackerService {
  constructor(
    private commonTrackerService: CommonTrackerService,
    private trackersRepository: TrackersRepository,

    private fixDatesAssignmentService: FixDatesAssignmentService,
  ) {}

  validateCloseAssignment({ assignment, endDate }: IValidadeCloseAssignmentParams) {
    if (assignment.status === StatusAssignment.close) {
      // Impedindo de trackers sem fim serem criados em uma atribuição fechada
      if (!endDate) {
        throw new AppError(trackerErrors.omitEndInAClosedAssignment);
      }

      // Validando se a data de fim é inferior a da atribuição já fechada
      if (isAfter(endDate, assignment.endDate)) {
        throw new AppError(trackerErrors.endDateInvalidCloseAssignments);
      }
    }
  }

  async stopTracker(tracker_id: string, user: User) {
    // Pegando o tracker
    const tracker = await this.commonTrackerService.getTracker({
      id: tracker_id,
      organization_id: user.organization_id,
    });

    // Validando se o colaborador logado e o do tracker são os mesmos
    if (user.collaborator.id !== tracker.collaborator_id) {
      throw new AppError(trackerErrors.differentCollaboratorsTrackerUser);
    }

    // Validando se o tracker está aberto (não possui data de fim)
    if (tracker.end) {
      throw new AppError(trackerErrors.stopTrackerStoped);
    }

    // Definindo a data atual como data de fim do tracker
    tracker.end = new Date();

    // Validando o tempo limite
    this.commonTrackerService.validateTrackerTimeLimit(tracker.start, tracker.end);

    // Salvando as alterações
    await this.trackersRepository.save(tracker);

    // Causando os efeitos colaterais na atribuição
    if (tracker.assignment_id) {
      await this.fixDatesAssignmentService.recalculateDates(tracker.assignment_id, 'end');
    }

    return tracker;
  }

  async execute({
    id,
    end,
    start,
    assignment_id,
    reason,
    organization_id,
    user,
  }: IUpdateTrackerService) {
    // Pegando o tracker a ser atualizado junto com a atribuição dele (Gera um erro se não encontrar)
    const tracker = await this.commonTrackerService.getTracker({
      id,
      relations: ['assignment'],
      organization_id,
    });

    // Validando se é um acesso pessoal
    const personalAccess = this.commonTrackerService.checkPersonalAccess({
      extraPermission: PermissionsUser.update_tracker,
      user,
      collaborator_id: tracker.collaborator_id,
    });

    const datesController = new DatesController({
      start: tracker.start,
      end: tracker.end,
      parent_id: tracker.assignment_id,
    });

    // Validando e atualizando a atribuição
    if (assignment_id !== tracker.assignment_id) {
      // Mudando de uma atribuição (ou nada) para outra atribuição
      if (assignment_id) {
        // Busca a atribuição e já valida o colaborador e a disponibilidade da tarefa
        const newAssignment = await this.commonTrackerService.resolveAssingment({
          assignment_id,
          collaborator_id: tracker.collaborator_id,
          start,
          organization_id,
        });

        // Validando a data em casos de atribuição estiver fechada
        this.validateCloseAssignment({ assignment: newAssignment, endDate: end });

        // Atribuindo a nova atribuição
        tracker.assignment = newAssignment;
        tracker.assignment_id = assignment_id;
      }
      // Mudando de um atribuição para nada (um motivo escrito)
      else {
        // Removendo a atribuição
        tracker.assignment_id = null;
        tracker.assignment = undefined;
      }
    }

    // Atualizando o Motivo do tracker
    tracker.reason = tracker.assignment_id ? null : reason;

    // Validando alterações nas datas
    if (start !== tracker.start || end !== tracker.end) {
      // Validando casos de omissão da data de fim
      if (!end) {
        // Validando se é uma acesso pessoal para poder omitir o fim
        if (!personalAccess) {
          throw new AppError(trackerErrors.omitEndWithoutPersonal);
        }

        // Validando a duração maxima de um tracker
        this.commonTrackerService.validateTrackerTimeLimit(start, new Date());

        // Validadando se a data de inicio do tracker é superior a data de fim do ultimo tracker
        const lastTracker = await this.commonTrackerService.getLastTracker(tracker.collaborator_id);

        if (lastTracker && isBefore(start, lastTracker.end)) {
          throw new AppError(trackerErrors.omitEndStartBeforeLastTracker);
        }
      } else {
        // Validando a duração maxima de um tracker
        this.commonTrackerService.validateTrackerTimeLimit(start, end);

        // Valida se as datas são validas
        validateStartEndDate({ end, start });
      }

      // Validando novamente as datas da atrinbuição para casos de ela estar fechada
      if (tracker.assignment) {
        this.validateCloseAssignment({ assignment: tracker.assignment, endDate: end });
      }

      // Validar se existe algum tracker registrado no mesmo periodo que o que está sendo atualizado
      await this.commonTrackerService.validadeDateOnSamePeriod({
        collaborator_id: tracker.collaborator_id,
        end: end || new Date(),
        start,
        tracker_id: tracker.id,
      });

      // Atualizando as datas
      tracker.start = start;
      tracker.end = end;
    }

    // Salvando as alterações
    await this.trackersRepository.save(tracker);

    datesController.updateDates({
      start: tracker.start,
      end: tracker.end,
      parent_id: tracker.assignment_id,
    });

    if (datesController.needChangeDates()) {
      if (datesController.changed('parent') && datesController.getParentId('old')) {
        await this.fixDatesAssignmentService.recalculateDates(
          datesController.getParentId('old'),
          'full',
        );
      }

      if (tracker.assignment_id) {
        await this.fixDatesAssignmentService.recalculateDates(
          tracker.assignment_id,
          datesController.getMode(),
        );
      }
    }

    return tracker;
  }
}
