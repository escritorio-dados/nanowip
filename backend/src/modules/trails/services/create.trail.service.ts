import { Injectable } from '@nestjs/common';

import { TrailDto } from '../dtos/trail.dto';
import { TrailsRepository } from '../repositories/trails.repository';
import { CommonTrailService } from './common.trail.service';

type ICreateTrailService = TrailDto & { organization_id: string };

@Injectable()
export class CreateTrailService {
  constructor(
    private trailsRepository: TrailsRepository,
    private commonTrailService: CommonTrailService,
  ) {}

  async execute({ name, organization_id }: ICreateTrailService) {
    await this.commonTrailService.validadeName({ name, organization_id });

    const trail = await this.trailsRepository.create({ name: name.trim(), organization_id });

    return trail;
  }
}
