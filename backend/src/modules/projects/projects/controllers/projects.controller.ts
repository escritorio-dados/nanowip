import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Post,
  Body,
  Param,
  Put,
  HttpCode,
  Delete,
} from '@nestjs/common';

import { CheckPermissions } from '@shared/providers/casl/decorators/checkPermissions.decorator';
import { CaslActions } from '@shared/providers/casl/enums/actions.casl.enum';
import { PermissionsGuard } from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { ProjectDto } from '../dtos/project.dto';
import { Project } from '../entities/Project';
import { FindAllLimitedProjectsQuery } from '../query/findAllLimited.project.query';
import { FindPaginationProjectQuery } from '../query/findPagination.project.query';
import { CreateProjectService } from '../services/create.project.service';
import { DeleteProjectService } from '../services/delete.project.service';
import { FindAllProjectService } from '../services/findAll.project.service';
import { FindOneProjectService } from '../services/findOne.project.service';
import { RecalculateDatesProjectService } from '../services/recalculateDates.project.service';
import { UpdateProjectService } from '../services/update.project.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private findAllProjectService: FindAllProjectService,
    private findOneProjectService: FindOneProjectService,
    private createProjectService: CreateProjectService,
    private updateProjectService: UpdateProjectService,
    private deleteProjectService: DeleteProjectService,
    private recalculateDatesProjectService: RecalculateDatesProjectService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Project))
  @Get()
  async listProjects(
    @Request() { user }: ICurrentUser,
    @Query() query: FindPaginationProjectQuery,
  ) {
    return this.findAllProjectService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Project))
  @Get('/limited/root')
  async findAllLimitedRoot(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedProjectsQuery,
  ) {
    return this.findAllProjectService.findAllLimited({
      organization_id: user.organization_id,
      query,
      onlyRoot: true,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Project))
  @Get('/limited/all')
  async findAllLimitedAll(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedProjectsQuery,
  ) {
    return this.findAllProjectService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Project))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneProjectService.getInfo({ id, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Project))
  @Post()
  async create(@Body() input: ProjectDto, @Request() { user }: ICurrentUser) {
    return this.createProjectService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Project))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: ProjectDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateProjectService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Project))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteProjectService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @HttpCode(204)
  @Post('/recalculate_dates')
  async recalculateDates(@Request() { user }: ICurrentUser) {
    await this.recalculateDatesProjectService.recalculateDates(user.organization_id);
  }
}
