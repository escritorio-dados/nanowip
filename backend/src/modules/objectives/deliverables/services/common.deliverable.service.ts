import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Deliverable } from '../entities/Deliverable';
import { deliverablesErrors } from '../errors/deliverables.errors';
import { DeliverablesRepository } from '../repositories/deliverables.repository';

type IGetDeliverableProps = { id: string; relations?: string[]; organization_id: string };

type IValidateDeliverable = {
  deliverable: Deliverable;
  organization_id: string;
};

@Injectable()
export class CommonDeliverableService {
  constructor(private deliverablesRepository: DeliverablesRepository) {}

  async getDeliverable({ id, relations, organization_id }: IGetDeliverableProps) {
    const deliverable = await this.deliverablesRepository.findById({
      id,
      relations,
    });

    this.validateDeliverable({ deliverable, organization_id });

    return deliverable;
  }

  validateDeliverable({ deliverable, organization_id }: IValidateDeliverable) {
    if (!deliverable) {
      throw new AppError(deliverablesErrors.notFound);
    }

    validateOrganization({ entity: deliverable, organization_id });
  }
}
