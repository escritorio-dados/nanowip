import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { MilestonesGroup } from '../entities/MilestonesGroup';
import { milestonesGroupsErrors } from '../errors/milestonesGroup.errors';
import { MilestonesGroupsRepository } from '../repositories/milestonesGroups.repository';

type IGetMilestonesGroup = { id: string; organization_id: string; relations?: string[] };
type IValidateMilestonesGroup = { milestonesGroup: MilestonesGroup; organization_id: string };

@Injectable()
export class CommonMilestonesGroupService {
  constructor(private milestonesGroupsRepository: MilestonesGroupsRepository) {}

  validateMilestonesGroup({ milestonesGroup, organization_id }: IValidateMilestonesGroup) {
    if (!milestonesGroup) {
      throw new AppError(milestonesGroupsErrors.notFound);
    }

    validateOrganization({ entity: milestonesGroup, organization_id });
  }

  async getMilestonesGroup({ id, organization_id, relations }: IGetMilestonesGroup) {
    const milestonesGroup = await this.milestonesGroupsRepository.findById(id, relations);

    this.validateMilestonesGroup({ milestonesGroup, organization_id });

    return milestonesGroup;
  }
}
