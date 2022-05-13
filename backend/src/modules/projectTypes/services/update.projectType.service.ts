import { Injectable } from '@nestjs/common';

import { ProjectType } from '@modules/projectTypes/entities/ProjectType';

import { ProjectTypeDto } from '../dtos/projectType.dto';
import { ProjectTypesRepository } from '../repositories/projectTypes.repository';
import { CommonProjectTypeService } from './common.projectType.service';

type IUpdateProjectTypeService = ProjectTypeDto & { organization_id: string; id: string };

@Injectable()
export class UpdateProjectTypeService {
  constructor(
    private projectTypesRepository: ProjectTypesRepository,
    private commonProjectTypeService: CommonProjectTypeService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateProjectTypeService): Promise<ProjectType> {
    const projectType = await this.commonProjectTypeService.getProjectType({ id, organization_id });

    if (projectType.name.toLowerCase() !== name.trim().toLowerCase()) {
      await this.commonProjectTypeService.validadeName({ name, organization_id });
    }

    projectType.name = name.trim();

    await this.projectTypesRepository.save(projectType);

    return projectType;
  }
}
