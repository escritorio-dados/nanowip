import { Injectable } from '@nestjs/common';

import { TaskTypeDto } from '../dtos/taskType.dto';
import { TaskTypesRepository } from '../repositories/taskTypes.repository';
import { CommonTaskTypeService } from './common.taskType.service';

type IUpdateTaskTypeService = TaskTypeDto & { id: string; organization_id: string };

@Injectable()
export class UpdateTaskTypeService {
  constructor(
    private taskTypesRepository: TaskTypesRepository,
    private commonTaskTypeService: CommonTaskTypeService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateTaskTypeService) {
    const taskType = await this.commonTaskTypeService.getTaskType({ id, organization_id });

    if (taskType.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonTaskTypeService.validadeName({ name, organization_id });
    }

    taskType.name = name.trim();

    await this.taskTypesRepository.save(taskType);

    return taskType;
  }
}
