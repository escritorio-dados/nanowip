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

import { ProjectTypeDto } from '../dtos/projectType.dto';
import { ProjectType } from '../entities/ProjectType';
import { FindAllLimitedProjectTypesQuery } from '../query/findAllLimited.projectTypes.query';
import { FindAllPaginationProjectTypesQuery } from '../query/findAllPaginationProjectTypes.query';
import { CreateProjectTypeService } from '../services/create.projectType.service';
import { DeleteProjectTypeService } from '../services/delete.projectType.service';
import { FindAllProjectTypeService } from '../services/findAll.projectType.service';
import { FindOneProjectTypeService } from '../services/findOne.projectType.service';
import { UpdateProjectTypeService } from '../services/update.projectType.service';

@Controller('project_types')
export class ProjectTypesController {
  constructor(
    private findAllProjectTypeService: FindAllProjectTypeService,
    private findOneProjectTypeService: FindOneProjectTypeService,
    private createProjectTypeService: CreateProjectTypeService,
    private updateProjectTypeService: UpdateProjectTypeService,
    private deleteProjectTypeService: DeleteProjectTypeService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ProjectType))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationProjectTypesQuery,
  ) {
    return this.findAllProjectTypeService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ProjectType))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedProjectTypesQuery,
  ) {
    return this.findAllProjectTypeService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ProjectType))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneProjectTypeService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, ProjectType))
  @Post()
  async create(@Body() input: ProjectTypeDto, @Request() { user }: ICurrentUser) {
    return this.createProjectTypeService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, ProjectType))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: ProjectTypeDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateProjectTypeService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, ProjectType))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteProjectTypeService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
