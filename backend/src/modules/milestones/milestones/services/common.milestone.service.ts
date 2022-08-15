import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Milestone } from '../entities/Milestone';
import { milestonesErrors } from '../errors/milestones.errors';
import { MilestonesRepository } from '../repositories/milestones.repository';

type IGetMilestone = { id: string; organization_id: string; relations?: string[] };
type IValidateMilestone = { milestone: Milestone; organization_id: string };

@Injectable()
export class CommonMilestoneService {
  constructor(private milestonesRepository: MilestonesRepository) {}

  validateMilestone({ milestone, organization_id }: IValidateMilestone) {
    if (!milestone) {
      throw new AppError(milestonesErrors.notFound);
    }

    validateOrganization({ entity: milestone, organization_id });
  }

  async getMilestone({ id, organization_id, relations }: IGetMilestone) {
    const milestone = await this.milestonesRepository.findById({ id, relations });

    this.validateMilestone({ milestone, organization_id });

    return milestone;
  }
}
