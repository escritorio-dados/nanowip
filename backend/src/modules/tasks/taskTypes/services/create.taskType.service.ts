import { Injectable } from '@nestjs/common';

import { TaskTypeDto } from '../dtos/taskType.dto';
import { TaskTypesRepository } from '../repositories/taskTypes.repository';
import { CommonTaskTypeService } from './common.taskType.service';

type ICreateTaskTypeService = TaskTypeDto & { organization_id: string };

@Injectable()
export class CreateTaskTypeService {
  constructor(
    private taskTypesRepository: TaskTypesRepository,
    private commonTaskTypeService: CommonTaskTypeService,
  ) {}

  async execute({ name, organization_id }: ICreateTaskTypeService) {
    await this.commonTaskTypeService.validadeName({ name, organization_id });

    const taskType = await this.taskTypesRepository.create({ name: name.trim(), organization_id });

    return taskType;
  }
}
