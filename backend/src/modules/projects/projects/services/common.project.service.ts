import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Project } from '../entities/Project';
import { projectErrors } from '../errors/project.errors';
import { ProjectsRepository } from '../repositories/projects.repository';
import { IFindByNameProjectRepository } from '../repositories/types';

type IGetProject = { id: string; relations?: string[]; organization_id: string };

type IValidateProject = { project: Project; organization_id: string };

@Injectable()
export class CommonProjectService {
  constructor(private projectsRepository: ProjectsRepository) {}

  async validadeName({
    name,
    customer_id,
    project_parent_id,
    organization_id,
  }: IFindByNameProjectRepository) {
    const project = await this.projectsRepository.findByName({
      name: name.trim(),
      customer_id,
      project_parent_id,
      organization_id,
    });

    if (project) {
      throw new AppError(projectErrors.duplicateName);
    }
  }

  async getProject({ id, organization_id, relations }: IGetProject) {
    const project = await this.projectsRepository.findById(id, relations);

    this.validateProject({ project, organization_id });

    return project;
  }

  validateProject({ project, organization_id }: IValidateProject) {
    if (!project) {
      throw new AppError(projectErrors.notFound);
    }

    validateOrganization({ entity: project, organization_id });
  }

  async getParent({ id, organization_id, relations }: IGetProject) {
    const project = await this.projectsRepository.findById(id, relations);

    this.validateProject({ project, organization_id });

    return project;
  }

  async validateProjectWithSubprojects(project_id: string) {
    const subprojects = await this.projectsRepository.findAllByParent(project_id);

    if (subprojects.length > 0) {
      throw new AppError(projectErrors.projectWithSubprojectsToSubproject);
    }
  }

  validateProjectParent(projectParent: Project) {
    if (!projectParent.customer_id || projectParent.project_parent_id) {
      throw new AppError(projectErrors.subprojectsOfsubprojects);
    }
  }
}
