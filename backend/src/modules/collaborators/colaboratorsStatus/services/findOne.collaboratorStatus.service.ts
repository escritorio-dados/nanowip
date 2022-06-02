import { Injectable } from '@nestjs/common';

import { CommonCollaboratorStatusService } from './common.collaboratorStatus.service';

type IFindOneCollaboratorStatusService = { id: string; organization_id: string };

@Injectable()
export class FindOneCollaboratorStatusService {
  constructor(private commonCollaboratorStatusService: CommonCollaboratorStatusService) {}

  async execute({ id, organization_id }: IFindOneCollaboratorStatusService) {
    const collaboratorStatus = await this.commonCollaboratorStatusService.getCollaboratorStatus({
      id,
      organization_id,
    });

    return collaboratorStatus;
  }
}
