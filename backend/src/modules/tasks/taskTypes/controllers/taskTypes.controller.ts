import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
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

import { TaskTypeDto } from '../dtos/taskType.dto';
import { TaskType } from '../entities/TaskType';
import { FindAllLimitedTaskTypesQuery } from '../query/findAllLimited.taskTypes.query';
import { FindAllPaginationTaskTypesQuery } from '../query/findAllPagination.taskTypes.query';
import { CreateTaskTypeService } from '../services/create.taskType.service';
import { DeleteTaskTypeService } from '../services/delete.taskType.service';
import { FindAllTaskTypeService } from '../services/findAll.taskType.service';
import { FindOneTaskTypeService } from '../services/findOne.taskType.service';
import { UpdateTaskTypeService } from '../services/update.taskType.service';

@Controller('task_types')
export class TaskTypesController {
  constructor(
    private findAllTaskTypeService: FindAllTaskTypeService,
    private findOneTaskTypeService: FindOneTaskTypeService,
    private createTaskTypeService: CreateTaskTypeService,
    private updateTaskTypeService: UpdateTaskTypeService,
    private deleteTaskTypeService: DeleteTaskTypeService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, TaskType))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationTaskTypesQuery,
  ) {
    return this.findAllTaskTypeService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, TaskType))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedTaskTypesQuery,
  ) {
    return this.findAllTaskTypeService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, TaskType))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneTaskTypeService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, TaskType))
  @Post()
  async create(@Body() input: TaskTypeDto, @Request() { user }: ICurrentUser) {
    return this.createTaskTypeService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, TaskType))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: TaskTypeDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateTaskTypeService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, TaskType))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    const deleted = await this.deleteTaskTypeService.execute({
      id,
      organization_id: user.organization_id,
    });

    return deleted;
  }
}
