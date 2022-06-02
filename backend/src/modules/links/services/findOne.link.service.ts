import { Injectable } from '@nestjs/common';

import { CommonLinkService } from './common.link.service';

type IFindOneLinkService = { id: string; organization_id: string };

@Injectable()
export class FindOneLinkService {
  constructor(private commonLinkService: CommonLinkService) {}

  async execute({ id, organization_id }: IFindOneLinkService) {
    return this.commonLinkService.getLink({ id, organization_id });
  }
}
