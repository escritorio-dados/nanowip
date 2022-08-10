import { Injectable } from '@nestjs/common';
import { isAfter } from 'date-fns';

import { IFindAll } from '@shared/types/types';
import { mapFromArray } from '@shared/utils/mapFromArray';

import { DeliverableTag } from '@modules/objectives/deliverableTags/entities/DeliverableTag';
import { FindAllDeliverableTagService } from '@modules/objectives/deliverableTags/services/findAll.deliverableTag.service';
import { getProgressValueChains } from '@modules/valueChains/utils/getProgressValueChains';

import { FindByCategoryObjectiveSectionQuery } from '../query/findByCategory.objectiveSection.query';
import { ObjectiveSectionsRepository } from '../repositories/objectiveSections.repository';

type IMap = { [key: string]: string };

@Injectable()
export class FindAllObjectiveSectionService {
  constructor(
    private objectiveSectionsRepository: ObjectiveSectionsRepository,
    private findAllDeliverableTagService: FindAllDeliverableTagService,
  ) {}

  async findAllByCategoryTags({
    organization_id,
    query,
  }: IFindAll<FindByCategoryObjectiveSectionQuery>) {
    // Pegar todas as sections, sem deliverables, e pegando as tags relacionadas com eles.
    const objectiveSections = await this.objectiveSectionsRepository.findAllByCategoryTagsInfo({
      objective_category_id: query.objective_category_id,
      organization_id,
    });

    // Pegar todos os deliverables tags, de forma semelhante ao que já é pego, junto com as tags
    const deliverables = await this.findAllDeliverableTagService.findAllByCategory({
      organization_id,
      query: { objective_category_id: query.objective_category_id },
    });

    const deliverablesSorted = deliverables.sort((a, b) => {
      if (a.maxAvailableDate && b.maxAvailableDate) {
        return isAfter(b.maxAvailableDate, a.maxAvailableDate) ? 1 : -1;
      }

      return !a.maxAvailableDate ? -1 : 1;
    });

    // Adicionar os deliverables tags a cada uma das sections com as mesmos tags com tarefas disponiveis ou iniciadas
    const sectionsMap = mapFromArray(
      objectiveSections,
      section => section.id,
      section => ({ ...section, deliverablesTags: [] as DeliverableTag[], tagsGroup: undefined }),
    );

    const tagsSectionsIdsMap = objectiveSections.reduce<IMap>((map, section) => {
      if (section.tagsGroup) {
        section.tagsGroup.tags.forEach(tag => {
          map[tag.name] = section.id;
        });
      }

      return map;
    }, {} as IMap);

    const deliverablesEnd: DeliverableTag[] = [];
    const deliverablesStart: DeliverableTag[] = [];

    deliverablesSorted.forEach(deliverable => {
      if (!deliverable.goalValueChains) {
        deliverablesStart.push(deliverable);

        return;
      }

      if (deliverable.goalValueChains === deliverable.progressValueChains) {
        deliverablesEnd.push(deliverable);

        return;
      }

      const sectionsDeliverable: IMap = {};

      let deliberableInSection = false;

      deliverable.tags.forEach(tag => {
        const section_id = tagsSectionsIdsMap[tag];

        if (section_id) {
          sectionsDeliverable[section_id] = section_id;

          deliberableInSection = true;
        }
      });

      Object.values(sectionsDeliverable).forEach(section_id => {
        sectionsMap[section_id] = {
          ...sectionsMap[section_id],
          deliverablesTags: [...sectionsMap[section_id].deliverablesTags, deliverable],
        };
      });

      if (!deliberableInSection) {
        deliverablesStart.push(deliverable);
      }
    });

    return {
      sections: Object.values(sectionsMap),
      deliverablesStart,
      deliverablesEnd,
    };
  }

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
