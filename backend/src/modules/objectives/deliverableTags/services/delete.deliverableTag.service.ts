import { Injectable } from '@nestjs/common';

import { DeliverableTagsRepository } from '../repositories/deliverableTags.repository';
import { CommonDeliverableTagService } from './common.deliverableTag.service';

type IDeleteDeliverableTagService = { id: string; organization_id: string };

@Injectable()
export class DeleteDeliverableTagService {
  constructor(
    private deliverablesRepository: DeliverableTagsRepository,
    private commonDeliverableTagService: CommonDeliverableTagService,
  ) {}

  async execute({ id, organization_id }: IDeleteDeliverableTagService) {
    const deliverable = await this.commonDeliverableTagService.getDeliverableTag({
      id,
      organization_id,
    });

    await this.deliverablesRepository.delete(deliverable);
  }
}
