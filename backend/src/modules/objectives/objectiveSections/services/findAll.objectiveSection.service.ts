import { Injectable } from '@nestjs/common';

import { IFindAll } from '@shared/types/types';

import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';

import { FindByCategoryObjectiveSectionQuery } from '../query/findByCategory.objectiveSection.query';
import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';

@Injectable()
export class FindAllObjectiveSectionService {
  constructor(private objectiveSectionsRepository: ObjectiveSectionsRepository) {}

  async findAllByCategory({
    organization_id,
    query,
  }: IFindAll<FindByCategoryObjectiveSectionQuery>) {
    const objectiveSections = await this.objectiveSectionsRepository.findAllByCategoryInfo({
      objective_category_id: query.objective_category_id,
      organization_id,
    });

    const objectiveSectionsFormatted = objectiveSections.map(os => {
      const deliverablesFormatted = os.deliverables.map(deliverable => {
        const { progress, goal } = getProgressValueChains(deliverable.valueChains);

        return {
          ...deliverable,
          valueChains: undefined,
          progressValueChains: progress,
          goalValueChains: goal,
        };
      });

      return {
        ...os,
        deliverables: deliverablesFormatted,
      };
    });

    return objectiveSectionsFormatted;
  }
}
