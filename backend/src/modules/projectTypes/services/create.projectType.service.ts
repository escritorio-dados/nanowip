import { Injectable } from '@nestjs/common';

import { ProjectType } from '@modules/projectTypes/entities/ProjectType';

import { ProjectTypeDto } from '../dtos/projectType.dto';
import { ProjectTypesRepository } from '../repositories/projectTypes.repository';
import { CommonProjectTypeService } from './common.projectType.service';

type ICreateProjectTypeService = ProjectTypeDto & { organization_id: string };

@Injectable()
export class CreateProjectTypeService {
  constructor(
    private projectTypesRepository: ProjectTypesRepository,
    private commonProjectTypeService: CommonProjectTypeService,
  ) {}

  async execute({ name, organization_id }: ICreateProjectTypeService): Promise<ProjectType> {
    await this.commonProjectTypeService.validadeName({ name, organization_id });

    const projectType = await this.projectTypesRepository.create({
      name: name.trim(),
      organization_id,
    });

    return projectType;
  }
}
