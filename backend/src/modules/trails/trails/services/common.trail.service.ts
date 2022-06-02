import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { trailErrors } from '../errors/trail.errors';
import { TrailsRepository } from '../repositories/trails.repository';

type IValidateName = { name: string; organization_id: string };

type IGetTrail = { id: string; organization_id: string };

@Injectable()
export class CommonTrailService {
  constructor(private trailsRepository: TrailsRepository) {}

  async validadeName({ name, organization_id }: IValidateName) {
    const trailWithSameName = await this.trailsRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (trailWithSameName) {
      throw new AppError(trailErrors.duplicateName);
    }
  }

  async getTrail({ id, organization_id }: IGetTrail) {
    const trail = await this.trailsRepository.findById(id);

    if (!trail) {
      throw new AppError(trailErrors.notFound);
    }

    validateOrganization({ entity: trail, organization_id });

    return trail;
  }
}
