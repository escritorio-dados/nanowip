import { Injectable } from '@nestjs/common';

import { TrailSectionsRepository } from '../repositories/trailSections.repository';
import { CommonTrailSectionService } from './common.trailSection.service';

type IDeleteTrailSectionService = { id: string; organization_id: string };

@Injectable()
export class DeleteTrailSectionService {
  constructor(
    private trailSectionsRepository: TrailSectionsRepository,
    private commonTrailSectionService: CommonTrailSectionService,
  ) {}

  async execute({ id, organization_id }: IDeleteTrailSectionService) {
    const trailSection = await this.commonTrailSectionService.getTrailSection({
      id,
      organization_id,
    });

    await this.trailSectionsRepository.delete(trailSection);
  }
}
