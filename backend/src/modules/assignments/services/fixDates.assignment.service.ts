import { Injectable } from '@nestjs/common';
import { min, max } from 'date-fns';

import { DatesController } from '@shared/utils/ServiceDatesController';

import { AssignmentsRepository } from '@modules/assignments/repositories/assignments.repository';
import { FixDatesTaskService } from '@modules/tasks/tasks/services/fixDates.task.service';
import { Tracker } from '@modules/trackers/entities/Tracker';

@Injectable()
export class FixDatesAssignmentService {
  constructor(
    private assignmentsRepository: AssignmentsRepository,

    private fixDatesTaskService: FixDatesTaskService,
  ) {}

  recalculateStartDate(trackers: Tracker[]) {
    // Pegando somente as datas de inicio dos trackers, e removendo da lista as datas vazias
    const dates = trackers.map(({ start }) => start).filter(date => !!date);

    // Se algum tracker iniciou vai renornar a menor data entre eles
    if (dates.length >= 1) {
      return min(dates);
    }

    // Se nenhum tracker inicou retorna null
    return null;
  }

  recalculateEndDate(trackers: Tracker[]) {
    // Pegando somente as datas de fim dos trackers, e removendo da lista as datas vazias
    const dates = trackers.map(({ end }) => end).filter(date => !!date);

    // Se algum tracker finalizou vai renornar a maior data entre eles
    if (dates.length >= 1) {
      return max(dates);
    }

    // Se nenhum tracker finalizou retorna null
    return null;
  }

  async recalculateDates(assignment_id: string, mode: 'full' | 'start' | 'end' | 'available') {
    const assignment = await this.assignmentsRepository.findById(assignment_id, ['trackers']);

    const datesController = new DatesController({
      start: assignment.startDate,
      end: assignment.endDate,
    });

    // Data de inicio
    if (mode === 'start' || mode === 'full') {
      assignment.startDate = this.recalculateStartDate(assignment.trackers);
    }

    // Data de término
    if (mode === 'end' || mode === 'full') {
      assignment.endDate = this.recalculateEndDate(assignment.trackers);
    }

    datesController.updateDates({ start: assignment.startDate, end: assignment.endDate });

    if (datesController.needChangeDates()) {
      await this.assignmentsRepository.save(assignment);

      await this.fixDatesTaskService.recalculateDates(
        assignment.task_id,
        datesController.getMode(),
      );
    }
  }
}
