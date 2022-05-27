import { Injectable } from '@nestjs/common';

import {
  recalculateAvailableDate,
  recalculateEndDate,
  recalculateStartDate,
} from '@shared/utils/changeDatesAux';
import { DatesController } from '@shared/utils/ServiceDatesController';

import { ProjectsRepository } from '../repositories/projects.repository';

@Injectable()
export class FixDatesProjectService {
  constructor(private projectsRepository: ProjectsRepository) {}

  async recalculateDates(project_id: string, mode: 'full' | 'start' | 'end' | 'available') {
    const project = await this.projectsRepository.findById(project_id, ['products', 'subprojects']);

    const datesController = new DatesController({
      start: project.startDate,
      end: project.endDate,
      available: project.availableDate,
    });

    const subEntities = [...project.products, ...project.subprojects];

    // Data de inicio
    if (mode === 'available' || mode === 'full') {
      project.availableDate = recalculateAvailableDate(subEntities);
    }

    // Data de inicio
    if (mode === 'start' || mode === 'full') {
      project.startDate = recalculateStartDate(subEntities);
    }

    // Data de término
    if (mode === 'end' || mode === 'full') {
      project.endDate = recalculateEndDate(subEntities);
    }

    datesController.updateDates({
      start: project.startDate,
      end: project.endDate,
      available: project.availableDate,
    });

    if (datesController.needChangeDates()) {
      await this.projectsRepository.save(project);

      if (project.project_parent_id) {
        await this.recalculateDates(project.project_parent_id, datesController.getMode());
      }
    }
  }
}
