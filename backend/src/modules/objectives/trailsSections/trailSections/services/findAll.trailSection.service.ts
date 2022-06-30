import { Injectable } from '@nestjs/common';

import { IFindAll } from '@shared/types/types';

import { FindByTrailTrailSectionQuery } from '../query/findByTrail.trailSection.query';
import { TrailSectionsRepository } from '../repositories/trailSections.repository';

@Injectable()
export class FindAllTrailSectionService {
  constructor(private trailSectionsRepository: TrailSectionsRepository) {}

  async findAllByTrail({ organization_id, query }: IFindAll<FindByTrailTrailSectionQuery>) {
    const trailSections = await this.trailSectionsRepository.findAllByTrailInfo({
      section_trail_id: query.section_trail_id,
      organization_id,
    });

    return trailSections;
  }
}
