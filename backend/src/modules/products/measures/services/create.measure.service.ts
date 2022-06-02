import { Injectable } from '@nestjs/common';

import { MeasureDto } from '../dtos/measure.dto';
import { MeasuresRepository } from '../repositories/measures.repository';
import { CommonMeasureService } from './common.measure.service';

type ICreateMeasureService = MeasureDto & { organization_id: string };

@Injectable()
export class CreateMeasureService {
  constructor(
    private measuresRepository: MeasuresRepository,
    private commonMeasureService: CommonMeasureService,
  ) {}

  async execute({ name, organization_id }: ICreateMeasureService) {
    await this.commonMeasureService.validadeName({ name, organization_id });

    const measure = await this.measuresRepository.create({ name: name.trim(), organization_id });

    return measure;
  }
}
