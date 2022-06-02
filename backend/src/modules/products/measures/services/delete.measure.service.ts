import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { measureErrors } from '../errors/measure.errors';
import { MeasuresRepository } from '../repositories/measures.repository';
import { CommonMeasureService } from './common.measure.service';

type IDeleteMeasureService = { id: string; organization_id: string };

@Injectable()
export class DeleteMeasureService {
  constructor(
    private measuresRepository: MeasuresRepository,
    private commonMeasureService: CommonMeasureService,
  ) {}

  async execute({ id, organization_id }: IDeleteMeasureService) {
    const measure = await this.commonMeasureService.getMeasure({
      id,
      relations: ['products'],
      organization_id,
    });

    if (measure.products.length > 0) {
      throw new AppError(measureErrors.deleteWithProducts);
    }

    await this.measuresRepository.delete(measure);
  }
}
