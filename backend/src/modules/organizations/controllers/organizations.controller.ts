import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { CheckPermissions } from '@shared/providers/casl/decorators/checkPermissions.decorator';
import { CaslActions } from '@shared/providers/casl/enums/actions.casl.enum';
import { PermissionsGuard } from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { User } from '@modules/users/users/entities/User';

import { OrganizationDto } from '../dtos/organization.dto';
import { organizationErrors } from '../errors/organization.errors';
import { FindAllPaginationOrganizationsQuery } from '../query/findAllPagination.organizations.query';
import { DEFAULT_ORGANIZATION_IDS } from '../seeds/organizations.seeds';
import { CreateOrganizationService } from '../services/create.organization.service';
import { DeleteOrganizationService } from '../services/delete.organization.service';
import { FindAllOrganizationService } from '../services/findAll.organization.service';
import { FindOneOrganizationService } from '../services/findOne.organization.service';
import { UpdateOrganizationService } from '../services/update.organization.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private findAllOrganizationService: FindAllOrganizationService,
    private findOneOrganizationService: FindOneOrganizationService,
    private createOrganizationService: CreateOrganizationService,
    private updateOrganizationService: UpdateOrganizationService,
    private deleteOrganizationService: DeleteOrganizationService,
  ) {}

  private validateOrganization(user: User) {
    if (user.organization_id !== DEFAULT_ORGANIZATION_IDS.SYSTEM) {
      throw new AppError(organizationErrors.manipulateFromOutSystemOrg);
    }
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationOrganizationsQuery,
  ) {
    this.validateOrganization(user);

    return this.findAllOrganizationService.findAllPagination({
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @Get(':id')
  async getOrganization(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    this.validateOrganization(user);

    return this.findOneOrganizationService.execute({ id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @Post()
  async createOrganization(@Body() input: OrganizationDto, @Request() { user }: ICurrentUser) {
    this.validateOrganization(user);

    return this.createOrganizationService.execute({ ...input });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @Put(':id')
  async updateOrganization(
    @Param() { id }: IParamId,
    @Body() input: OrganizationDto,
    @Request() { user }: ICurrentUser,
  ) {
    this.validateOrganization(user);

    return this.updateOrganizationService.execute({ id, ...input });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @HttpCode(204)
  @Delete(':id')
  async deleteOrganization(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    this.validateOrganization(user);

    await this.deleteOrganizationService.execute({ id });
  }
}
