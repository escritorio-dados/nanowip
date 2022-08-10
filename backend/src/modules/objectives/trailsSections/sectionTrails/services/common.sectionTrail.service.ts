import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { SectionTrail } from '../entities/SectionTrail';
import { sectionTrailErrors } from '../errors/sectionTrail.errors';
import { SectionTrailsRepository } from '../repositories/sectionTrails.repository';

type IValidateName = { name: string; organization_id: string };
type IValidateTrail = { sectionTrail: SectionTrail; organization_id: string };
type IGetTrail = { id: string; organization_id: string; relations?: string[] };

@Injectable()
export class CommonSectionTrailService {
  constructor(private sectionTrailsRepository: SectionTrailsRepository) {}

  async validadeName({ name, organization_id }: IValidateName) {
    const sectionTrailWithSameName = await this.sectionTrailsRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (sectionTrailWithSameName) {
      throw new AppError(sectionTrailErrors.duplicateName);
    }
  }

  async getTrail({ id, organization_id, relations }: IGetTrail) {
    const sectionTrail = await this.sectionTrailsRepository.findById(id, relations);

    this.validateTrail({ sectionTrail, organization_id });

    return sectionTrail;
  }

  validateTrail({ organization_id, sectionTrail }: IValidateTrail) {
    if (!sectionTrail) {
      throw new AppError(sectionTrailErrors.notFound);
    }

    validateOrganization({ entity: sectionTrail, organization_id });
  }
}
