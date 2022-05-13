import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { taskTypeErrors } from '../errors/taskType.errors';
import { TaskTypesRepository } from '../repositories/taskTypes.repository';

type IValidateName = { name: string; organization_id: string };
type IGetTaskType = { id: string; organization_id: string; relations?: string[] };

@Injectable()
export class CommonTaskTypeService {
  constructor(private taskTypesRepository: TaskTypesRepository) {}

  async validadeName({ name, organization_id }: IValidateName) {
    const taskTypeWithSameName = await this.taskTypesRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (taskTypeWithSameName) {
      throw new AppError(taskTypeErrors.duplicateName);
    }
  }

  async getTaskType({ id, organization_id, relations }: IGetTaskType) {
    const taskType = await this.taskTypesRepository.findById(id, relations);

    if (!taskType) {
      throw new AppError(taskTypeErrors.notFound);
    }

    validateOrganization({ entity: taskType, organization_id });

    return taskType;
  }
}
