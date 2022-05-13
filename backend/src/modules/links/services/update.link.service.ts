import { Injectable } from '@nestjs/common';

import { LinkDto } from '../dtos/link.dto';
import { LinksRepository } from '../repositories/links.repository';
import { CommonLinkService } from './common.link.service';

type IUpdateLinkService = LinkDto & { id: string; organization_id: string };

type IChangeStatus = { id: string; organization_id: string };

@Injectable()
export class UpdateLinkService {
  constructor(
    private linksRepository: LinksRepository,
    private commonLinkService: CommonLinkService,
  ) {}

  async changeStatus({ id, organization_id }: IChangeStatus) {
    const link = await this.commonLinkService.getLink({
      id,
      organization_id,
    });

    link.active = !link.active;

    await this.linksRepository.save(link);

    return link;
  }

  async execute({
    id,
    title,
    url,
    organization_id,
    category,
    description,
    owner,
  }: IUpdateLinkService) {
    const link = await this.commonLinkService.getLink({ id, organization_id });

    link.title = title.trim();
    link.url = url.trim();
    link.description = description?.trim();
    link.owner = owner?.trim();
    link.category = category?.trim();

    await this.linksRepository.save(link);

    return link;
  }
}
