import { Injectable } from '@nestjs/common';

import { SectionTrailDto } from '../dtos/sectionTrail.dto';
import { SectionTrailsRepository } from '../repositories/sectionTrails.repository';
import { CommonSectionTrailService } from './common.sectionTrail.service';

type IUpdateSectionTrailService = SectionTrailDto & { id: string; organization_id: string };

@Injectable()
export class UpdateSectionTrailService {
  constructor(
    private sectionTrailsRepository: SectionTrailsRepository,
    private commonSectionTrailService: CommonSectionTrailService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateSectionTrailService) {
    const sectionTrail = await this.commonSectionTrailService.getTrail({
      id,
      organization_id,
    });

    if (sectionTrail.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonSectionTrailService.validadeName({ name, organization_id });
    }

    sectionTrail.name = name.trim();

    await this.sectionTrailsRepository.save(sectionTrail);

    return sectionTrail;
  }
}
