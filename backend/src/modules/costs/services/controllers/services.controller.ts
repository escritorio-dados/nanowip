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

import { ServiceDto } from '../dtos/service.dto';
import { Service } from '../entities/Service';
import { FindAllLimitedServicesQuery } from '../query/findAllLimited.services.query';
import { FindAllPaginationServicesQuery } from '../query/findAllPagination.services.query';
import { CreateServiceService } from '../services/create.service.service';
import { DeleteServiceService } from '../services/delete.service.service';
import { FindAllServiceService } from '../services/findAll.service.service';
import { FindOneServiceService } from '../services/findOne.service.service';
import { UpdateServiceService } from '../services/update.service.service';

@Controller('services')
export class ServicesController {
  constructor(
    private findAllServiceService: FindAllServiceService,
    private findOneServiceService: FindOneServiceService,
    private createServiceService: CreateServiceService,
    private updateServiceService: UpdateServiceService,
    private deleteServiceService: DeleteServiceService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Service))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationServicesQuery,
  ) {
    return this.findAllServiceService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Service))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedServicesQuery,
  ) {
    return this.findAllServiceService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Service))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneServiceService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Service))
  @Post()
  async create(@Body() input: ServiceDto, @Request() { user }: ICurrentUser) {
    return this.createServiceService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Service))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: ServiceDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateServiceService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Service))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteServiceService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
