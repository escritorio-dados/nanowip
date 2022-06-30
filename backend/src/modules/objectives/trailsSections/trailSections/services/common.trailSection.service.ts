import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { TrailSection } from '../entities/TrailSection';
import { trailSectionsErrors } from '../errors/trailSections.errors';
import { TrailSectionsRepository } from '../repositories/trailSections.repository';

type IGetTrailSectionProps = { id: string; relations?: string[]; organization_id: string };

type IValidateNameTrailSection = {
  name: string;
  organization_id: string;
  section_trail_id: string;
};

type IValidateTrailSection = {
  trailSection: TrailSection;
  organization_id: string;
};

@Injectable()
export class CommonTrailSectionService {
  constructor(private trailSectionsRepository: TrailSectionsRepository) {}

  async validadeName({ name, organization_id, section_trail_id }: IValidateNameTrailSection) {
    const trailSection = await this.trailSectionsRepository.findByName({
      name: name.trim(),
      organization_id,
      section_trail_id,
    });

    if (trailSection) {
      throw new AppError(trailSectionsErrors.duplicateName);
    }
  }

  async getTrailSection({ id, relations, organization_id }: IGetTrailSectionProps) {
    const trailSection = await this.trailSectionsRepository.findById({
      id,
      relations,
    });

    this.validateTrailSection({ trailSection, organization_id });

    return trailSection;
  }

  validateTrailSection({ trailSection, organization_id }: IValidateTrailSection) {
    if (!trailSection) {
      throw new AppError(trailSectionsErrors.notFound);
    }

    validateOrganization({ entity: trailSection, organization_id });
  }
}
