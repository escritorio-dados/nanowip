import { Injectable } from '@nestjs/common';

import { LinkDto } from '../dtos/link.dto';
import { LinksRepository } from '../repositories/links.repository';

type ICreateLinkService = LinkDto & { organization_id: string };

@Injectable()
export class CreateLinkService {
  constructor(private linksRepository: LinksRepository) {}

  async execute({ title, url, organization_id, category, description, owner }: ICreateLinkService) {
    const link = await this.linksRepository.create({
      title: title.trim(),
      url: url.trim(),
      category: category?.trim(),
      description,
      owner: owner?.trim(),
      organization_id,
    });

    link.active = true;

    return link;
  }
}
