import { Injectable } from '@nestjs/common';

import { TrailSectionsRepository } from '../repositories/trailSections.repository';
import { CommonTrailSectionService } from './common.trailSection.service';

type IFindOneTrailSectionService = {
  id: string;
  organization_id: string;
  relations?: string[];
};

@Injectable()
export class FindOneTrailSectionService {
  constructor(
    private commonTrailSectionService: CommonTrailSectionService,
    private trailSectionsRepository: TrailSectionsRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneTrailSectionService) {
    const trailSection = await this.trailSectionsRepository.findById({
      id,
      relations: ['sectionTrail'],
    });

    this.commonTrailSectionService.validateTrailSection({
      trailSection,
      organization_id,
    });

    return trailSection;
  }

  async execute({ id, organization_id, relations }: IFindOneTrailSectionService) {
    return this.commonTrailSectionService.getTrailSection({
      id,
      organization_id,
      relations,
    });
  }
}
