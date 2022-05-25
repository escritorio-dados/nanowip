import { Injectable } from '@nestjs/common';
import { min, max, isAfter, isEqual } from 'date-fns';

import { AssignmentsRepository } from '@modules/assignments/repositories/assignments.repository';
import { FixDatesTaskService } from '@modules/tasks/tasks/services/fixDates.task.service';
import { Tracker } from '@modules/trackers/entities/Tracker';

type IVerifyDatesChangesParams = {
  assignment_id: string;
  newStartDate?: Date | null;
  newEndDate?: Date | null;
  oldStartDate?: Date;
};

type IVerifyRecalculateDatesParams = {
  assignment_id: string;
  changedStartDate: Date;
  changedEndDate: Date;
};

@Injectable()
export class FixDatesAssignmentService {
  constructor(
    private assignmentsRepository: AssignmentsRepository,

    private fixDatesTaskService: FixDatesTaskService,
  ) {}

  recalculateStartDate(trackers: Tracker[]): Date | null {
    // Pegando somente as datas de inicio dos trackers, e removendo da lista as datas vazias
    const dates = trackers.map(({ start }) => start).filter(date => !!date);

    // Se algum tracker iniciou vai renornar a menor data entre eles
    if (dates.length >= 1) {
      return min(dates);
    }

    // Se nenhum tracker inicou retorna null
    return null;
  }

  recalculateEndDate(trackers: Tracker[]): Date | null {
    // Pegando somente as datas de fim dos trackers, e removendo da lista as datas vazias
    const dates = trackers.map(({ end }) => end).filter(date => !!date);

    // Se algum tracker finalizou vai renornar a maior data entre eles
    if (dates.length >= 1) {
      return max(dates);
    }

    // Se nenhum tracker finalizou retorna null
    return null;
  }

  // Ela abrange atualmente o start / create / update
  async verifyDatesChanges({
    assignment_id,
    newStartDate,
    newEndDate,
    oldStartDate,
  }: IVerifyDatesChangesParams) {
    // Variavel de controle para verificar se pode ocorrer efeitos colaterais nas outras entidades
    let dateChanged = false;

    // Pegando a atribuição
    const assignment = await this.assignmentsRepository.findById(assignment_id);

    // Salvando as data antigas para serem usadas depois
    const oldAssignmentDates = { start: assignment.startDate, end: assignment.endDate };

    if (!assignment.startDate && newStartDate) {
      assignment.startDate = newStartDate;

      dateChanged = true;
    }

    // Verificando se vai ocorrer uma mudança direta na data de inicio
    if (newStartDate && isAfter(assignment.startDate, newStartDate)) {
      assignment.startDate = newStartDate;

      dateChanged = true;
    }

    // Verificando um caso de update de trocas de datas de inicio ficando null e sendo a referencia
    if (oldStartDate && !newStartDate && isEqual(oldStartDate, assignment.startDate)) {
      const assignmentWithTrackers = await this.assignmentsRepository.findById(assignment_id, [
        'trackers',
      ]);

      assignment.startDate = this.recalculateStartDate(assignmentWithTrackers.trackers);

      dateChanged = true;
    }

    // Verificando se a data de fim será removida
    if (!newEndDate) {
      assignment.endDate = null;
    }

    // Verificando se a data de fim será substituida
    if (!assignment.endDate || (newEndDate && isAfter(newEndDate, assignment.endDate))) {
      assignment.endDate = newEndDate;
    }

    // Salvando as alterações
    await this.assignmentsRepository.save(assignment);

    // Rodando os efeitos colaterais nas tarefas
    if (dateChanged) {
      await this.fixDatesTaskService.verifyDatesChanges({
        task_id: assignment.task_id,
        start: { new: assignment.startDate, old: oldAssignmentDates.start },
      });
    }
  }

  // Abrange atualmente o update (old assignment)
  async verifyRecalculateDates({
    assignment_id,
    changedStartDate,
    changedEndDate,
  }: IVerifyRecalculateDatesParams) {
    // Variavel de controle para verificar se pode ocorrer efeitos colaterais nas outras entidades
    let dateChanged = false;

    // Pegando a atribuição
    const assignment = await this.assignmentsRepository.findById(assignment_id, ['trackers']);

    // Salvando as data antigas para serem usadas depois
    const oldAssignmentDates = { start: assignment.startDate, end: assignment.endDate };

    // Verificando se vai ser necessario recalcular a data de inicio
    if (isEqual(assignment.startDate, changedStartDate)) {
      assignment.startDate = this.recalculateStartDate(assignment.trackers);

      dateChanged = true;
    }

    // Verificando se vai ser necessario recalcular a data de fim
    if (isEqual(assignment.endDate, changedEndDate)) {
      assignment.endDate = this.recalculateEndDate(assignment.trackers);
    }

    // Salvando as alterações
    await this.assignmentsRepository.save(assignment);

    // Verificando se vai ser necessario causar efeitos colaterais nas outras tarefas
    if (dateChanged) {
      await this.fixDatesTaskService.verifyDatesChanges({
        task_id: assignment.task_id,
        start: { new: assignment.startDate, old: oldAssignmentDates.start },
      });
    }
  }
}
