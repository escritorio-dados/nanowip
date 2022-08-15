import { Controller, Get, Request, Query } from '@nestjs/common';

import { ICurrentUser } from '@shared/types/request';

import { FindAllLimitedTagsQuery } from '../query/findAllLimited.tags.query';
import { FindAllTagService } from '../services/findAll.tag.service';

@Controller('tags')
export class TagsController {
  constructor(private findAllTagService: FindAllTagService) {}

  @Get('/')
  async findAllLimited(@Request() { user }: ICurrentUser, @Query() query: FindAllLimitedTagsQuery) {
    return this.findAllTagService.findUniqueTagsLimited({
      organization_id: user.organization_id,
      query,
    });
  }
}
