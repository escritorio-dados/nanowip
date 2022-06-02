import { Injectable } from '@nestjs/common';

import { TrailDto } from '../dtos/trail.dto';
import { TrailsRepository } from '../repositories/trails.repository';
import { CommonTrailService } from './common.trail.service';

type IUpdateTrailService = TrailDto & { id: string; organization_id: string };

@Injectable()
export class UpdateTrailService {
  constructor(
    private trailsRepository: TrailsRepository,
    private commonTrailService: CommonTrailService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateTrailService) {
    const trail = await this.commonTrailService.getTrail({ id, organization_id });

    if (trail.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonTrailService.validadeName({ name, organization_id });
    }

    trail.name = name.trim();

    await this.trailsRepository.save(trail);

    return trail;
  }
}
