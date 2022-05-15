import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { ServiceDatesController } from '@shared/utils/ServiceDatesController';

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

    const serviceDateController = new ServiceDatesController(project);

    // Causando os efeitos colaterais
    if (project.project_parent_id) {
      await this.fixDatesProjectService.verifyDatesChanges({
        project_id: project.project_parent_id,
        ...serviceDateController.getDeleteParams(),
      });
    }
  }
}
