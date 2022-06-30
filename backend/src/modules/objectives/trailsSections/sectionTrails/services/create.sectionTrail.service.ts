import { Injectable } from '@nestjs/common';

import { SectionTrailDto } from '../dtos/sectionTrail.dto';
import { SectionTrailsRepository } from '../repositories/sectionTrails.repository';
import { CommonSectionTrailService } from './common.sectionTrail.service';

type ICreateSectionTrailService = SectionTrailDto & { organization_id: string };

@Injectable()
export class CreateSectionTrailService {
  constructor(
    private sectionTrailsRepository: SectionTrailsRepository,
    private commonSectionTrailService: CommonSectionTrailService,
  ) {}

  async execute({ name, organization_id }: ICreateSectionTrailService) {
    await this.commonSectionTrailService.validadeName({
      name,
      organization_id,
    });

    const sectionTrail = await this.sectionTrailsRepository.create({
      name: name.trim(),
      organization_id,
    });

    return sectionTrail;
  }
}
