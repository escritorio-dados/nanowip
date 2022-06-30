import {
  Controller,
  UseGuards,
  Request,
  Get,
  Query,
  Param,
  Post,
  Body,
  Put,
  HttpCode,
  Delete,
} from '@nestjs/common';

import { CheckPermissions } from '@shared/providers/casl/decorators/checkPermissions.decorator';
import { CaslActions } from '@shared/providers/casl/enums/actions.casl.enum';
import { PermissionsGuard } from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { ObjectiveSection } from '@modules/objectives/objectiveSections/entities/ObjectiveSection';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

import { InstantiateSectionTrailDto } from '../dtos/instantiateSectionTrail.dto';
import { SectionTrailDto } from '../dtos/sectionTrail.dto';
import { SectionTrail } from '../entities/SectionTrail';
import { FindAllLimitedSectionTrailsQuery } from '../query/findAllLimited.sectionTrails.query';
import { FindAllPaginationSectionTrailsQuery } from '../query/findAllPagination.sectionTrails.query';
import { CreateSectionTrailService } from '../services/create.sectionTrail.service';
import { DeleteSectionTrailService } from '../services/delete.sectionTrail.service';
import { FindAllSectionTrailService } from '../services/findAll.sectionTrail.service';
import { FindOneSectionTrailService } from '../services/findOne.sectionTrail.service';
import { InstantiateSectionTrailService } from '../services/instantitate.sectionTrail.service';
import { UpdateSectionTrailService } from '../services/update.sectionTrail.service';

@Controller('section_trails')
export class SectionTrailsController {
  constructor(
    private findAllSectionTrailService: FindAllSectionTrailService,
    private findOneSectionTrailService: FindOneSectionTrailService,
    private createSectionTrailService: CreateSectionTrailService,
    private updateSectionTrailService: UpdateSectionTrailService,
    private deleteSectionTrailService: DeleteSectionTrailService,
    private instantiateSectionTrailService: InstantiateSectionTrailService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(
    ability => ability.can(CaslActions.read, SectionTrail),
    ability => ability.can(CaslActions.read, ValueChain),
  )
  @Get()
  async findPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationSectionTrailsQuery,
  ) {
    return this.findAllSectionTrailService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, SectionTrail))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedSectionTrailsQuery,
  ) {
    return this.findAllSectionTrailService.findAllLimited({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, SectionTrail))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneSectionTrailService.execute({ id, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, SectionTrail))
  @Post()
  async create(@Body() input: SectionTrailDto, @Request() { user }: ICurrentUser) {
    return this.createSectionTrailService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, ObjectiveSection))
  @Post('/instantiate')
  async instantiateSectionTrail(
    @Body() input: InstantiateSectionTrailDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.instantiateSectionTrailService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, SectionTrail))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: SectionTrailDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateSectionTrailService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, SectionTrail))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteSectionTrailService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
