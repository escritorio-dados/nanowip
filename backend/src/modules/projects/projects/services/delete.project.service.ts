import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { projectErrors } from '../errors/project.errors';
import { ProjectsRepository } from '../repositories/projects.repository';
import { CommonProjectService } from './common.project.service';
import { FixDatesProjectService } from './fixDates.project.service';

type IDeleteProjectService = { id: string; organization_id: string };

@Injectable()
export class DeleteProjectService {
  constructor(
    private projectsRepository: ProjectsRepository,
    private commonProjectService: CommonProjectService,
    private fixDatesProjectService: FixDatesProjectService,
  ) {}

  async execute({ id, organization_id }: IDeleteProjectService) {
    const project = await this.commonProjectService.getProject({
      id,
      organization_id,
      relations: ['subprojects', 'products'],
    });

    if (project.subprojects.length > 0) {
      throw new AppError(projectErrors.deleteWithSubprojects);
    }

    if (project.products.length > 0) {
      throw new AppError(projectErrors.deleteWithProducts);
    }

    await this.projectsRepository.delete(project);

    // Causando os efeitos colaterais
    if (project.project_parent_id) {
      await this.fixDatesProjectService.recalculateDates(project.project_parent_id, 'full');
    }
  }
}
