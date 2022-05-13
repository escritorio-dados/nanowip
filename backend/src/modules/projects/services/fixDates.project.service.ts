import { Injectable } from '@nestjs/common';

import {
  INeedRecalculate,
  verifyChangesEndDates,
  verifyChangesInitDates,
  verifyNeedRecalculate,
} from '@shared/utils/changeDatesAux';
import { DatesChangesController, IOldNewDatesFormat } from '@shared/utils/DatesChangeController';

import { ProjectsRepository } from '../repositories/projects.repository';

type IVerifyDatesChanges = IOldNewDatesFormat & {
  project_id: string;
  deleted?: boolean;
};

@Injectable()
export class FixDatesProjectService {
  constructor(private projectsRepository: ProjectsRepository) {}

  async validadeSubEntities(data: INeedRecalculate) {
    const needRecalculate = verifyNeedRecalculate(data);

    if (needRecalculate) {
      const { products, subprojects } = await this.projectsRepository.findById(
        data.currentObject.id,
        ['products', 'subprojects'],
      );

      return [...products, ...subprojects];
    }

    return undefined;
  }

  async verifyDatesChanges({ project_id, start, available, end, deleted }: IVerifyDatesChanges) {
    if (!available && !end && !start && !deleted) {
      return;
    }

    const project = await this.projectsRepository.findById(project_id);

    const datesController = new DatesChangesController(project);

    const subEntities = await this.validadeSubEntities({
      currentObject: project,
      available,
      deleted,
      end,
      start,
    });

    if (available) {
      project.availableDate = await verifyChangesInitDates({
        datesController,
        currentDate: project.availableDate,
        newDate: available.new,
        oldDate: available.old,
        subEntities,
        type: 'changeAvailable',
      });
    }

    if (start) {
      project.startDate = await verifyChangesInitDates({
        datesController,
        currentDate: project.startDate,
        newDate: start.new,
        oldDate: start.old,
        subEntities,
        type: 'changeStart',
      });
    }

    if (end || deleted) {
      project.endDate = await verifyChangesEndDates({
        datesController,
        currentDate: project.endDate,
        newDate: end?.new,
        subEntities,
        deleted,
      });
    }

    if (datesController.needSave()) {
      await this.projectsRepository.save(project);

      if (project.project_parent_id) {
        await this.verifyDatesChanges({
          project_id: project.project_parent_id,
          ...datesController.getUpdateDatesParams({
            newAvailableDate: project.availableDate,
            newStartDate: project.startDate,
            newEndDate: project.endDate,
          }),
        });
      }
    }
  }
}
