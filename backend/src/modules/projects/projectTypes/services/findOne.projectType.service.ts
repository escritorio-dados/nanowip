import { Injectable } from '@nestjs/common';

import { CommonProjectTypeService } from './common.projectType.service';

type IFindOneProjectTypeService = { id: string; organization_id: string };

@Injectable()
export class FindOneProjectTypeService {
  constructor(private commonProjectTypeService: CommonProjectTypeService) {}

  async execute({ id, organization_id }: IFindOneProjectTypeService) {
    return this.commonProjectTypeService.getProjectType({
      id,
      organization_id,
    });
  }
}
