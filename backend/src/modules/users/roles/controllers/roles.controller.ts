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
  Delete,
  HttpCode,
} from '@nestjs/common';

import { CheckPermissions } from '@shared/providers/casl/decorators/checkPermissions.decorator';
import { CaslActions } from '@shared/providers/casl/enums/actions.casl.enum';
import { PermissionsGuard } from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { RoleDto } from '../dtos/role.dto';
import { Role } from '../entities/Role';
import { FindAllLimitedRolesQuery } from '../query/findAllLimited.roles.query';
import { FindAllPaginationRolesQuery } from '../query/findAllPagination.roles.query';
import { CreateRoleService } from '../services/createRole.service';
import { DeleteRoleService } from '../services/deleteRole.service';
import { FindAllRoleService } from '../services/findAllRole.service';
import { FindOneRoleService } from '../services/findOneRole.service';
import { UpdateRoleService } from '../services/updateRole.service';

@Controller('roles')
export class RolesController {
  constructor(
    private findAllRoleService: FindAllRoleService,
    private findOneRoleService: FindOneRoleService,
    private createRoleService: CreateRoleService,
    private updateRoleService: UpdateRoleService,
    private deleteRoleService: DeleteRoleService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Role))
  @Get()
  async listPaginationRoles(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationRolesQuery,
  ) {
    return this.findAllRoleService.findPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Role))
  @Get('/limited')
  async listAllRoles(@Request() { user }: ICurrentUser, @Query() query: FindAllLimitedRolesQuery) {
    return this.findAllRoleService.findAllLimited({ organization_id: user.organization_id, query });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Role))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneRoleService.execute({ id, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Role))
  @Post()
  async create(@Body() input: RoleDto, @Request() { user }: ICurrentUser) {
    return this.createRoleService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Role))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: RoleDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateRoleService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Role))
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteRoleService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
