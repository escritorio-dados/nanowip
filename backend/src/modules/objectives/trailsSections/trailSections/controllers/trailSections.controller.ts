import {
  Controller,
  Get,
  UseGuards,
  Request,
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

import { SectionTrail } from '../../sectionTrails/entities/SectionTrail';
import { CreateTrailSectionDto } from '../dtos/create.trailSection.dto';
import { UpdateTrailSectionDto } from '../dtos/update.trailSection.dto';
import { UpdatePositionsTrailSectionDto } from '../dtos/updatePositions.trailSection.dto';
import { FindByTrailTrailSectionQuery } from '../query/findByTrail.trailSection.query';
import { CreateTrailSectionService } from '../services/create.trailSection.service';
import { DeleteTrailSectionService } from '../services/delete.trailSection.service';
import { FindAllTrailSectionService } from '../services/findAll.trailSection.service';
import { FindOneTrailSectionService } from '../services/findOne.trailSection.service';
import { UpdateTrailSectionService } from '../services/update.trailSection.service';

@Controller('trail_sections')
export class TrailSectionsController {
  constructor(
    private findAllTrailSectionService: FindAllTrailSectionService,
    private findOneTrailSectionService: FindOneTrailSectionService,
    private createTrailSectionService: CreateTrailSectionService,
    private updateTrailSectionService: UpdateTrailSectionService,
    private deleteTrailSectionService: DeleteTrailSectionService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, SectionTrail))
  @Get('/')
  async findByObjective(
    @Request() { user }: ICurrentUser,
    @Query() query: FindByTrailTrailSectionQuery,
  ) {
    return this.findAllTrailSectionService.findAllByTrail({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, SectionTrail))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneTrailSectionService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, SectionTrail))
  @Post()
  async create(@Body() input: CreateTrailSectionDto, @Request() { user }: ICurrentUser) {
    return this.createTrailSectionService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, SectionTrail))
  @HttpCode(204)
  @Put('/sort')
  async sort(@Body() input: UpdatePositionsTrailSectionDto, @Request() { user }: ICurrentUser) {
    await this.updateTrailSectionService.updatePositions({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, SectionTrail))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateTrailSectionDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateTrailSectionService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, SectionTrail))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteTrailSectionService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
