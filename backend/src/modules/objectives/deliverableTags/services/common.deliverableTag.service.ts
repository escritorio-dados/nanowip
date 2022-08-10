import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { DeliverableTag } from '../entities/DeliverableTag';
import { deliverablesErrors } from '../errors/deliverables.errors';
import { DeliverableTagsRepository } from '../repositories/deliverableTags.repository';

type IGetDeliverableTagProps = { id: string; relations?: string[]; organization_id: string };

type IValidateDeliverableTag = {
  deliverable: DeliverableTag;
  organization_id: string;
};

@Injectable()
export class CommonDeliverableTagService {
  constructor(private deliverablesRepository: DeliverableTagsRepository) {}

  async getDeliverableTag({ id, relations, organization_id }: IGetDeliverableTagProps) {
    const deliverable = await this.deliverablesRepository.findById({
      id,
      relations,
    });

    this.validateDeliverableTag({ deliverable, organization_id });

    return deliverable;
  }

  validateDeliverableTag({ deliverable, organization_id }: IValidateDeliverableTag) {
    if (!deliverable) {
      throw new AppError(deliverablesErrors.notFound);
    }

    validateOrganization({ entity: deliverable, organization_id });
  }
}
