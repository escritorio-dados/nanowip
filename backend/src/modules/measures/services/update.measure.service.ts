import { Injectable } from '@nestjs/common';

import { MeasureDto } from '../dtos/measure.dto';
import { MeasuresRepository } from '../repositories/measures.repository';
import { CommonMeasureService } from './common.measure.service';

type IUpdateMeasureService = MeasureDto & { organization_id: string; id: string };

@Injectable()
export class UpdateMeasureService {
  constructor(
    private measuresRepository: MeasuresRepository,
    private commonMeasureService: CommonMeasureService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateMeasureService) {
    const measure = await this.commonMeasureService.getMeasure({ id, organization_id });

    if (measure.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonMeasureService.validadeName({ name, organization_id });
    }

    measure.name = name.trim();

    await this.measuresRepository.save(measure);

    return measure;
  }
}
