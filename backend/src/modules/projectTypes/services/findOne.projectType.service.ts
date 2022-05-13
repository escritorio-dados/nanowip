import { Injectable } from '@nestjs/common';

import { ProjectType } from '@modules/projectTypes/entities/ProjectType';

import { CommonProjectTypeService } from './common.projectType.service';

type IFindOneProjectTypeService = { id: string; organization_id: string };

@Injectable()
export class FindOneProjectTypeService {
  constructor(private commonProjectTypeService: CommonProjectTypeService) {}

  async execute({ id, organization_id }: IFindOneProjectTypeService): Promise<ProjectType> {
    return this.commonProjectTypeService.getProjectType({
      id,
      organization_id,
    });
  }
}
