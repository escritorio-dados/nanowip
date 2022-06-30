import { Injectable } from '@nestjs/common';

import { IFindAll } from '@shared/types/types';

import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';

import { FindBySectionDeliverableQuery } from '../query/findBySection.deliverable.query';
import { DeliverablesRepository } from '../repositories/deliverables.repository';

@Injectable()
export class FindAllDeliverableService {
  constructor(private deliverablesRepository: DeliverablesRepository) {}

  async findAllBySection({ organization_id, query }: IFindAll<FindBySectionDeliverableQuery>) {
    const deliverables = await this.deliverablesRepository.findAllBySectionInfo({
      objective_section_id: query.objective_section_id,
      organization_id,
    });

    const deliverablesFormatted = deliverables.map(deliverable => {
      const { progress, goal } = getProgressValueChains(deliverable.valueChains);

      return {
        ...deliverable,
        valueChains: undefined,
        progressValueChains: progress,
        goalValueChains: goal,
      };
    });

    return deliverablesFormatted;
  }
}
