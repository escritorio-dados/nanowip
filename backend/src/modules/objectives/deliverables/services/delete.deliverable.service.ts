import { Injectable } from '@nestjs/common';

import { DeliverablesRepository } from '../repositories/deliverables.repository';
import { CommonDeliverableService } from './common.deliverable.service';

type IDeleteDeliverableService = { id: string; organization_id: string };

@Injectable()
export class DeleteDeliverableService {
  constructor(
    private deliverablesRepository: DeliverablesRepository,
    private commonDeliverableService: CommonDeliverableService,
  ) {}

  async execute({ id, organization_id }: IDeleteDeliverableService) {
    const deliverable = await this.commonDeliverableService.getDeliverable({
      id,
      organization_id,
    });

    await this.deliverablesRepository.delete(deliverable);
  }
}
