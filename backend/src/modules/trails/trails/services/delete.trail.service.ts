import { Injectable } from '@nestjs/common';

import { TrailsRepository } from '@modules/trails/trails/repositories/trails.repository';

import { CommonTrailService } from './common.trail.service';

type IDeleteTrailService = { id: string; organization_id: string };

@Injectable()
export class DeleteTrailService {
  constructor(
    private trailsRepository: TrailsRepository,
    private commonTrailService: CommonTrailService,
  ) {}

  async execute({ id, organization_id }: IDeleteTrailService) {
    const trail = await this.commonTrailService.getTrail({ id, organization_id });

    await this.trailsRepository.delete(trail);
  }
}
