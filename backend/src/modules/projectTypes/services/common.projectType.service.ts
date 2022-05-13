import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { projectTypeErrors } from '../errors/projectType.errors';
import { ProjectTypesRepository } from '../repositories/projectTypes.repository';

type IValidateName = { name: string; organization_id: string };

type IGetProjectType = { id: string; organization_id: string; relations?: string[] };

@Injectable()
export class CommonProjectTypeService {
  constructor(private projectTypesRepository: ProjectTypesRepository) {}

  async validadeName({ name, organization_id }: IValidateName): Promise<void> {
    const projectTypeWithSameName = await this.projectTypesRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (projectTypeWithSameName) {
      throw new AppError(projectTypeErrors.duplicateName);
    }
  }

  async getProjectType({ id, organization_id, relations }: IGetProjectType) {
    const projectType = await this.projectTypesRepository.findById(id, relations);

    if (!projectType) {
      throw new AppError(projectTypeErrors.notFound);
    }

    // Validando se o usuario tem acesso a esta informação
    validateOrganization({ entity: projectType, organization_id });

    return projectType;
  }
}
