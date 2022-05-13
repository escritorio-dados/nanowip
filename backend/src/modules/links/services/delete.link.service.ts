import { Injectable } from '@nestjs/common';

import { LinksRepository } from '../repositories/links.repository';
import { CommonLinkService } from './common.link.service';

type IDeleteLinkService = { id: string; organization_id: string };

@Injectable()
export class DeleteLinkService {
  constructor(
    private linksRepository: LinksRepository,
    private commonLinkService: CommonLinkService,
  ) {}

  async execute({ id, organization_id }: IDeleteLinkService) {
    const link = await this.commonLinkService.getLink({
      id,
      organization_id,
    });

    await this.linksRepository.delete(link);
  }
}
