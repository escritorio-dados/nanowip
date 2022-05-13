import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { linkErrors } from '../errors/link.errors';
import { LinksRepository } from '../repositories/links.repository';

type IGetLinkProps = { id: string; organization_id: string };

@Injectable()
export class CommonLinkService {
  constructor(private linksRepository: LinksRepository) {}

  async getLink({ id, organization_id }: IGetLinkProps) {
    const link = await this.linksRepository.findById({ id });

    if (!link) {
      throw new AppError(linkErrors.notFound);
    }

    validateOrganization({ entity: link, organization_id });

    return link;
  }
}
