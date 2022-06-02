import { Injectable } from '@nestjs/common';
import { isAfter, isBefore } from 'date-fns';

import { AppError } from '@shared/errors/AppError';
import { validateStartEndDate } from '@shared/utils/validadeDates';

import { StatusAssignment } from '@modules/assignments/enums/status.assignment.enum';
import { FixDatesAssignmentService } from '@modules/assignments/services/fixDates.assignment.service';
import { FindOneCollaboratorService } from '@modules/collaborators/collaborators/services/findOne.collaborator.service';
import { User } from '@modules/users/users/entities/User';
import { PermissionsUser } from '@modules/users/users/enums/permissionsUser.enum';

import { CreateTrackerDto } from '../dtos/create.tracker.dto';
import { CreatePersonalTrackerDto } from '../dtos/createPersonal.tracker.dto';
import { StartTrackerDto } from '../dtos/start.tracker.dto';
import { trackerErrors } from '../errors/tracker.errors';
import { TrackersRepository } from '../repositories/trackers.repository';
import { ICreateTrackerRepository } from '../repositories/types';
import { CommonTrackerService } from './common.tracker.service';

type ICreateTrackerService = CreateTrackerDto & {
  organization_id: string;
  personal?: boolean;
};
type ICreatePersonal = CreatePersonalTrackerDto & { user?: User };

type IStartTracker = StartTrackerDto & { organization_id: string; user: User };

@Injectable()
export class CreateTrackerService {
  constructor(
    private commonTrackerService: CommonTrackerService,
    private trackersRepository: TrackersRepository,

    private findOneCollaboratorService: FindOneCollaboratorService,
    private fixDatesAssignmentService: FixDatesAssignmentService,
  ) {}

  async startTracker({ assignment_id, reason, organization_id, user }: IStartTracker) {
    const newTracker = {
      organization_id,
    } as ICreateTrackerRepository;

    // Validando e atribuindo o colaborador (usuario loggado)
    const collaborator_id = user.collaborator.id;

    newTracker.collaborator = await this.findOneCollaboratorService.execute({
      id: collaborator_id,
      organization_id,
    });

    // Atribuindo a data de inicio
    newTracker.start = new Date();

    // Validando e atribuindo a atribuição
    if (assignment_id) {
      // Busca a atribuição e já valida o colaborador e a disponibilidade da tarefa
      const assignment = await this.commonTrackerService.resolveAssingment({
        assignment_id,
        collaborator_id,
        start: newTracker.start,
        organization_id,
      });

      // Impedindo de ser iniciado em atribuições fechadas
      if (assignment.status === StatusAssignment.close) {
        throw new AppError(trackerErrors.startTrackerInAssignmentClosed);
      }

      newTracker.assignment = assignment;
    } else {
      // Atribuindo o motivo
      newTracker.reason = reason;
    }

    // Fechando se possivel qualquer tracker aberto do colaborador (erro se não conseguir)
    await this.commonTrackerService.closeOpenTracker({ collaborator_id, start: newTracker.start });

    // Salvando no Banco de dados
    const tracker = await this.trackersRepository.create(newTracker);

    // Causando os efeitos colaterais (Datas de inicio e fim das outras entidades)
    if (assignment_id) {
      await this.fixDatesAssignmentService.recalculateDates(assignment_id, 'start');
    }

    return tracker;
  }

  async createPersonal({ user, ...data }: ICreatePersonal) {
    // Validando se é um acesso pessoal
    const personalAccess = this.commonTrackerService.checkPersonalAccess({
      extraPermission: PermissionsUser.create_tracker,
      user,
      collaborator_id: user.collaborator.id,
    });

    return this.execute({
      ...data,
      personal: personalAccess,
      collaborator_id: user.collaborator.id,
      organization_id: user.organization_id,
    });
  }

  async execute({
    collaborator_id,
    end,
    start,
    assignment_id,
    reason,
    organization_id,
    personal,
  }: ICreateTrackerService) {
    const newTracker = {
      organization_id,
    } as ICreateTrackerRepository;

    // Validando e atribuindo o Colaborador
    newTracker.collaborator = await this.findOneCollaboratorService.execute({
      id: collaborator_id,
      organization_id,
    });

    // Validando e atribuindo a atribuição
    if (assignment_id) {
      // Busca a atribuição e já valida o colaborador e a disponibilidade da tarefa
      const assignment = await this.commonTrackerService.resolveAssingment({
        assignment_id,
        collaborator_id,
        start,
        organization_id,
      });

      // Validando a data em casos de atribuição estiver fechada
      if (assignment.status === StatusAssignment.close) {
        // Impedindo de trackers sem fim serem criados em uma atribuição fechada
        if (!end) {
          throw new AppError(trackerErrors.omitEndInAClosedAssignment);
        }

        // Validando se a data de fim é inferior a da atribuição já fechada
        if (isAfter(end, assignment.endDate)) {
          throw new AppError(trackerErrors.endDateInvalidCloseAssignments);
        }
      }

      newTracker.assignment = assignment;
    } else {
      // Atribuindo o motivo
      newTracker.reason = reason;
    }

    // Validando casos de omissão da data de fim
    if (!end) {
      // Validando se é uma acesso pessoal para poder omitir o fim
      if (!personal) {
        throw new AppError(trackerErrors.omitEndWithoutPersonal);
      }

      // Validando a duração maxima de um tracker
      this.commonTrackerService.validateTrackerTimeLimit(start, new Date());

      // Validadando se a data de inicio do tracker é superior a data de fim do ultimo tracker
      const lastTracker = await this.commonTrackerService.getLastTracker(collaborator_id);

      if (lastTracker && isBefore(start, lastTracker.end)) {
        throw new AppError(trackerErrors.omitEndStartBeforeLastTracker);
      }
    } else {
      // Validar o tempo limite
      this.commonTrackerService.validateTrackerTimeLimit(start, end);

      // Valida se as datas são validas
      validateStartEndDate({ end, start });
    }

    // Fechando se possivel qualquer tracker aberto do colaborador (erro se não conseguir)
    await this.commonTrackerService.closeOpenTracker({ collaborator_id, start });

    // Validar se existe algum tracker registrado no mesmo periodo que o que está sendo criado
    await this.commonTrackerService.validadeDateOnSamePeriod({
      collaborator_id,
      end: end || new Date(),
      start,
    });

    // Atribuindo as datas de inicio e fim
    newTracker.start = start;
    newTracker.end = end;

    // Criar e Salvar o tracker no banco de dados
    const tracker = await this.trackersRepository.create(newTracker);

    // Causando os efeitos colaterais nas datas das entidades relacionadas
    if (assignment_id) {
      const mode = tracker.start && tracker.end ? 'full' : tracker.start ? 'start' : 'end';

      await this.fixDatesAssignmentService.recalculateDates(assignment_id, mode);
    }

    return tracker;
  }
}
