import { Injectable } from '@nestjs/common';
import { differenceInHours } from 'date-fns';

import { Tracker } from '@modules/trackers/entities/Tracker';
import { TrackersRepository } from '@modules/trackers/repositories/trackers.repository';
import { FindAllTrackerService } from '@modules/trackers/services/findAll.tracker.service';

import { StatusAssignment } from '../enums/status.assignment.enum';
import { AssignmentsRepository } from '../repositories/assignments.repository';

type ICloseAssignmentService = { task_id: string; endDate: Date };

@Injectable()
export class CloseAssignmentsTaskService {
  constructor(
    private assignmentsRepository: AssignmentsRepository,

    private findAllTrackersService: FindAllTrackerService,

    private trackersRepository: TrackersRepository,
  ) {}

  async execute({ task_id, endDate }: ICloseAssignmentService) {
    const assignments = await this.assignmentsRepository.findAllByTask(task_id);

    if (assignments.length === 0) {
      return;
    }

    // Fechando todas as atribuições
    const newAssignments = assignments.map(assignment => ({
      ...assignment,
      status: StatusAssignment.close,
      endDate,
    }));

    // Pegando todos os trackers dos assignments e excluindo os abertos
    const assignments_id = assignments.map(({ id }) => id);

    const trackers = await this.findAllTrackersService.findByAssignments({
      assignments_id,
      organization_id: assignments[0].organization_id,
    });

    // Pegando todos os trackers que não possuem uma data de término
    const trackersWithoutEnd = trackers.filter(tracker => !tracker.end);

    const deleteTrackers: Tracker[] = [];
    const saveTrackers: Tracker[] = [];

    trackersWithoutEnd.forEach(tracker => {
      const differenceDates = differenceInHours(endDate, tracker.start);

      if (differenceDates >= 12) {
        deleteTrackers.push(tracker);
      } else {
        saveTrackers.push({
          ...tracker,
          end: endDate,
        });
      }
    });

    await this.trackersRepository.deleteMany(deleteTrackers);

    await this.trackersRepository.saveManny(saveTrackers);

    await this.assignmentsRepository.saveAll(newAssignments);
  }
}
