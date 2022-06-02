import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { measureErrors } from '../errors/measure.errors';
import { MeasuresRepository } from '../repositories/measures.repository';

type IValidateName = { name: string; organization_id: string };
type IGetMeasure = { id: string; organization_id: string; relations?: string[] };

@Injectable()
export class CommonMeasureService {
  constructor(private measuresRepository: MeasuresRepository) {}

  async validadeName({ name, organization_id }: IValidateName) {
    const measureWithSameName = await this.measuresRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (measureWithSameName) {
      throw new AppError(measureErrors.duplicateName);
    }
  }

  async getMeasure({ id, organization_id, relations }: IGetMeasure) {
    const measure = await this.measuresRepository.findById(id, relations);

    if (!measure) {
      throw new AppError(measureErrors.notFound);
    }

    validateOrganization({ entity: measure, organization_id });

    return measure;
  }
}
