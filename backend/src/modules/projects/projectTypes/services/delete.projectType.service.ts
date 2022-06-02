import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { projectTypeErrors } from '../errors/projectType.errors';
import { ProjectTypesRepository } from '../repositories/projectTypes.repository';
import { CommonProjectTypeService } from './common.projectType.service';

type IDeleteProjectTypeService = { id: string; organization_id: string };

@Injectable()
export class DeleteProjectTypeService {
  constructor(
    private projectTypesRepository: ProjectTypesRepository,
    private commonProjectTypeService: CommonProjectTypeService,
  ) {}

  async execute({ id, organization_id }: IDeleteProjectTypeService) {
    const projectType = await this.commonProjectTypeService.getProjectType({
      id,
      relations: ['projects'],
      organization_id,
    });

    if (projectType.projects.length > 0) {
      throw new AppError(projectTypeErrors.deleteWithProjects);
    }

    await this.projectTypesRepository.delete(projectType);
  }
}
