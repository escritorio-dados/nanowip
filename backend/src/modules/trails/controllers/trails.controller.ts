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

import CheckPermissions from '@shared/providers/casl/decorators/checkPermissions.decorator';
import CaslActions from '@shared/providers/casl/enums/actions.casl.enum';
import PermissionsGuard from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { ValueChain } from '@modules/valueChains/entities/ValueChain';

import { InstantiateTrailDto } from '../dtos/instantiateTrail.dto';
import { TrailDto } from '../dtos/trail.dto';
import { Trail } from '../entities/Trail';
import { FindAllLimitedTrailsQuery } from '../query/findAllLimited.trails.query';
import { FindAllPaginationTrailsQuery } from '../query/findAllPagination.trails.query';
import { CreateTrailService } from '../services/create.trail.service';
import { DeleteTrailService } from '../services/delete.trail.service';
import { FindAllTrailService } from '../services/findAll.trail.service';
import { FindOneTrailService } from '../services/findOne.trail.service';
import { InstantiateTrailService } from '../services/instantitate.trail.service';
import { UpdateTrailService } from '../services/update.trail.service';

@Controller('trails')
export class TrailsController {
  constructor(
    private findAllTrailService: FindAllTrailService,
    private findOneTrailService: FindOneTrailService,
    private createTrailService: CreateTrailService,
    private updateTrailService: UpdateTrailService,
    private deleteTrailService: DeleteTrailService,

    private instantiateTrailService: InstantiateTrailService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(
    ability => ability.can(CaslActions.read, Trail),
    ability => ability.can(CaslActions.read, ValueChain),
  )
  @Get()
  async findPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationTrailsQuery,
  ) {
    return this.findAllTrailService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Trail))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedTrailsQuery,
  ) {
    return this.findAllTrailService.findAllLimited({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Trail))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneTrailService.execute({ id, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Trail))
  @Post()
  async create(@Body() input: TrailDto, @Request() { user }: ICurrentUser) {
    return this.createTrailService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, ValueChain))
  @Post('/instantiate')
  async instantiateTrail(@Body() input: InstantiateTrailDto, @Request() { user }: ICurrentUser) {
    return this.instantiateTrailService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Trail))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: TrailDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateTrailService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Trail))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteTrailService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
