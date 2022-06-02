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

import { Trail } from '@modules/trails/trails/entities/Trail';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

import { CreateTaskTrailDto } from '../dtos/create.taskTrail.dto';
import { UpdateTaskTrailDto } from '../dtos/update.taskTrail.dto';
import { FindAllGraphTaskTrailsQuery } from '../query/findAllGraph.taskTrails.query';
import { FindAllLimitedTaskTrailsQuery } from '../query/findAllLimited.taskTrails.query';
import { CreateTaskTrailService } from '../services/create.taskTrail.service';
import { DeleteTaskTrailService } from '../services/delete.taskTrail.service';
import { FindAllTaskTrailService } from '../services/findAll.taskTrail.service';
import { FindOneTaskTrailService } from '../services/findOne.taskTrail.service';
import { UpdateTaskTrailService } from '../services/update.taskTrail.service';

@Controller('task_trails')
export class TaskTrailsController {
  constructor(
    private findAllTaskTrailService: FindAllTaskTrailService,
    private findOneTaskTrailService: FindOneTaskTrailService,
    private createTaskTrailService: CreateTaskTrailService,
    private updateTaskTrailService: UpdateTaskTrailService,
    private deleteTaskTrailService: DeleteTaskTrailService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(
    ability => ability.can(CaslActions.read, Trail),
    ability => ability.can(CaslActions.read, ValueChain),
  )
  @Get()
  async findGraph(@Request() { user }: ICurrentUser, @Query() query: FindAllGraphTaskTrailsQuery) {
    return this.findAllTaskTrailService.findAllGraph({
      ...query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Trail))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedTaskTrailsQuery,
  ) {
    return this.findAllTaskTrailService.findAllLimited({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Trail))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneTaskTrailService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Trail))
  @Post()
  async create(@Body() input: CreateTaskTrailDto, @Request() { user }: ICurrentUser) {
    return this.createTaskTrailService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Trail))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateTaskTrailDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateTaskTrailService.execute({
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
    const deleted = await this.deleteTaskTrailService.execute({
      id,
      organization_id: user.organization_id,
    });

    return deleted;
  }
}
