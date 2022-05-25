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

import { CreateTaskReportCommentDto } from '../dtos/create.taskReportComment.dto';
import { UpdateTaskReportCommentDto } from '../dtos/update.taskReportComment.dto';
import { TaskReportComment } from '../entities/TaskReportComment';
import { FindAllByTaskReportLimitedTaskReportCommentQuery } from '../query/findAllByTaskReport.taskReportComment.query';
import { CreateTaskReportCommentService } from '../services/create.taskReportComment.service';
import { DeleteTaskReportCommentService } from '../services/delete.taskReportComment.service';
import { FindAllTaskReportCommentService } from '../services/findAll.taskReportComment.service';
import { FindOneTaskReportCommentService } from '../services/findOne.taskReportComment.service';
import { UpdateTaskReportCommentService } from '../services/update.taskReportComment.service';

@Controller('task_report_comments')
export class TaskReportCommentsController {
  constructor(
    private findAllTaskReportCommentService: FindAllTaskReportCommentService,
    private findOneTaskReportCommentService: FindOneTaskReportCommentService,
    private createTaskReportCommentService: CreateTaskReportCommentService,
    private updateTaskReportCommentService: UpdateTaskReportCommentService,
    private deleteTaskReportCommentService: DeleteTaskReportCommentService,
  ) {}

  @Get()
  async findAllTaskReport(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllByTaskReportLimitedTaskReportCommentQuery,
  ) {
    return this.findAllTaskReportCommentService.findbyTaskReport({
      organization_id: user.organization_id,
      query,
    });
  }

  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneTaskReportCommentService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, TaskReportComment))
  @Post()
  async create(@Body() input: CreateTaskReportCommentDto, @Request() { user }: ICurrentUser) {
    return this.createTaskReportCommentService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, TaskReportComment))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateTaskReportCommentDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateTaskReportCommentService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, TaskReportComment))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteTaskReportCommentService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
