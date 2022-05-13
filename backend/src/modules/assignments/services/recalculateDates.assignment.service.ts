import { Injectable } from '@nestjs/common';

import { sliceList } from '@shared/utils/sliceList';

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
      const assignmentsRecalculated = sliceAssignments.map(assignment => {
        const startCalculated = this.fixDatesAssignmentService.recalculateStartDate(
          assignment.trackers,
        );

        const endCalculated = this.fixDatesAssignmentService.recalculateEndDate(
          assignment.trackers,
        );

        return {
          ...assignment,
          startDateCalc: startCalculated,
          endDateCalc: endCalculated,
        };
      });

      await this.assignmentsRepository.saveAll(assignmentsRecalculated);
    }
  }
}
