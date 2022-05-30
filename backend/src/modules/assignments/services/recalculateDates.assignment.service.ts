import { Injectable } from '@nestjs/common';

import { isDifferentDate } from '@shared/utils/isDifferentDate';
import { sliceList } from '@shared/utils/sliceList';

import { Assignment } from '../entities/Assignment';
import { AssignmentsRepository } from '../repositories/assignments.repository';
import { FixDatesAssignmentService } from './fixDates.assignment.service';

@Injectable()
export class RecalculateDatesAssignmentService {
  constructor(
    private assignmentsRepository: AssignmentsRepository,
    private fixDatesAssignmentService: FixDatesAssignmentService,
  ) {}

  async recalculateDates(organization_id: string) {
    // Pegar todos os assignments junto com os seus trackers
    const assignments = await this.assignmentsRepository.findAll({
      relations: ['trackers'],
      organization_id,
    });

    // Separando o array em porções menores para conseguir salvar
    const slicedAssignments = sliceList({ array: assignments, maxLenght: 2000 });

    for await (const sliceAssignments of slicedAssignments) {
      const saveAssignments: Assignment[] = [];

      sliceAssignments.forEach(assignment => {
        const startCalculated = this.fixDatesAssignmentService.recalculateStartDate(
          assignment.trackers,
        );

        const endCalculated = this.fixDatesAssignmentService.recalculateEndDate(
          assignment.trackers,
        );

        if (
          isDifferentDate(startCalculated, assignment.startDate) ||
          isDifferentDate(endCalculated, assignment.endDate)
        ) {
          saveAssignments.push({
            ...assignment,
            startDate: startCalculated,
            endDate: endCalculated,
          });
        }
      });

      await this.assignmentsRepository.saveAll(saveAssignments);
    }
  }
}
