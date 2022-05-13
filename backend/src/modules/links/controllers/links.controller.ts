import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';

import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { LinkDto } from '../dtos/link.dto';
import { FindAllPaginationLinkQuery } from '../query/findAllPagination.link.query';
import { CreateLinkService } from '../services/create.link.service';
import { DeleteLinkService } from '../services/delete.link.service';
import { FindAllLinkService } from '../services/findAll.link.service';
import { FindOneLinkService } from '../services/findOne.link.service';
import { UpdateLinkService } from '../services/update.link.service';

@Controller('links')
export class LinksController {
  constructor(
    private findAllLinkService: FindAllLinkService,
    private findOneLinkService: FindOneLinkService,
    private createLinkService: CreateLinkService,
    private updateLinkService: UpdateLinkService,
    private deleteLinkService: DeleteLinkService,
  ) {}

  @Get()
  async findPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationLinkQuery,
  ) {
    return this.findAllLinkService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneLinkService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @Post()
  async create(@Body() input: LinkDto, @Request() { user }: ICurrentUser) {
    return this.createLinkService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: LinkDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateLinkService.execute({
      ...input,
      id,
      organization_id: user.organization_id,
    });
  }

  @Patch('/:id/state')
  async changeStateLink(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.updateLinkService.changeStatus({
      id,
      organization_id: user.organization_id,
    });
  }

  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteLinkService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
