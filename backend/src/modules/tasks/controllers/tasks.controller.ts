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

import CheckPermissions from '@shared/providers/casl/decorators/checkPermissions.decorator';
import CaslActions from '@shared/providers/casl/enums/actions.casl.enum';
import PermissionsGuard from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { CreateTaskDto } from '../dtos/createTask.dto';
import { UpdateTaskDto } from '../dtos/updateTask.dto';
import { Task } from '../entities/Task';
import { FindAllGraphTasksQuery } from '../query/findAllGraph.tasks.query';
import { FindAllLimitedTasksQuery } from '../query/findAllLimited.tasks.query';
import { CreateTaskService } from '../services/create.task.service';
import { DeleteTaskService } from '../services/delete.task.service';
import { FindAllTaskService } from '../services/findAll.task.service';
import { FindOneTaskService } from '../services/findOne.task.service';
import { RecalculateDatesTaskService } from '../services/recalculateDates.task.service';
import { UpdateTaskService } from '../services/update.task.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private findAllTaskService: FindAllTaskService,
    private findOneTaskService: FindOneTaskService,
    private createTaskService: CreateTaskService,
    private updateTaskService: UpdateTaskService,
    private deleteTaskService: DeleteTaskService,
    private recalculateDatesTasksService: RecalculateDatesTaskService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Task))
  @Get()
  async findGraph(@Request() { user }: ICurrentUser, @Query() query: FindAllGraphTasksQuery) {
    return this.findAllTaskService.findAllGraph({
      ...query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Task))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedTasksQuery,
  ) {
    return this.findAllTaskService.findAllLimited({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Task))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneTaskService.getInfo({ id, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Task))
  @Post()
  async create(@Body() input: CreateTaskDto, @Request() { user }: ICurrentUser) {
    return this.createTaskService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Task))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateTaskDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateTaskService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Task))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteTaskService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @HttpCode(204)
  @Post('/recalculate_dates')
  async recalculateDates(@Request() { user }: ICurrentUser) {
    await this.recalculateDatesTasksService.recalculateDates(user.organization_id);
  }
}
