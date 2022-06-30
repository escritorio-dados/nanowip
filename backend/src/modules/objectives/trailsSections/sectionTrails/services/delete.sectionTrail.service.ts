import { Injectable } from '@nestjs/common';

import { SectionTrailsRepository } from '../repositories/sectionTrails.repository';
import { CommonSectionTrailService } from './common.sectionTrail.service';

type IDeleteSectionTrailService = { id: string; organization_id: string };

@Injectable()
export class DeleteSectionTrailService {
  constructor(
    private sectionTrailsRepository: SectionTrailsRepository,
    private commonSectionTrailService: CommonSectionTrailService,
  ) {}

  async execute({ id, organization_id }: IDeleteSectionTrailService) {
    const sectionSectionTrail = await this.commonSectionTrailService.getTrail({
      id,
      organization_id,
    });

    await this.sectionTrailsRepository.delete(sectionSectionTrail);
  }
}
