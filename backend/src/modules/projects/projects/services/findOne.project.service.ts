import { Injectable } from '@nestjs/common';

import { getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';

import { ProjectsRepository } from '../repositories/projects.repository';
import { CommonProjectService } from './common.project.service';

type IFindOneProjectService = { id: string; organization_id: string };

@Injectable()
export class FindOneProjectService {
  constructor(
    private commonProjectService: CommonProjectService,
    private projectsRepository: ProjectsRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneProjectService) {
    const project = await this.projectsRepository.findByIdInfo(id);

    this.commonProjectService.validateProject({ organization_id, project });

    const projectFormatted = {
      ...project,
      statusDate: getStatusDate(project),
      pathString: getParentPathString({
        entity: project,
        getCustomer: true,
        skipFirstName: true,
        entityType: 'project',
      }),
    };

    return projectFormatted;
  }

  async execute({ id, organization_id }: IFindOneProjectService) {
    return this.commonProjectService.getProject({ id, organization_id });
  }
}
