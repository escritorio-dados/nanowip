import { Injectable } from '@nestjs/common';

import { Link } from '../entities/Link';
import { CommonLinkService } from './common.link.service';

type IFindOneLinkService = { id: string; organization_id: string };

@Injectable()
export class FindOneLinkService {
  constructor(private commonLinkService: CommonLinkService) {}

  async execute({ id, organization_id }: IFindOneLinkService): Promise<Link> {
    return this.commonLinkService.getLink({ id, organization_id });
  }
}
