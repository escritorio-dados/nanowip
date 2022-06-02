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

import { ServiceProviderDto } from '../dtos/serviceProvider.dto';
import { ServiceProvider } from '../entities/ServiceProvider';
import { FindAllLimitedServiceProvidersQuery } from '../query/findAllLimited.serviceProviders.query';
import { FindAllPaginationServiceProvidersQuery } from '../query/findAllPagination.serviceProviders.query';
import { CreateServiceProviderService } from '../services/create.serviceProvider.service';
import { DeleteServiceProviderService } from '../services/delete.serviceProvider.service';
import { FindAllServiceProviderService } from '../services/findAll.serviceProvider.service';
import { FindOneServiceProviderService } from '../services/findOne.serviceProvider.service';
import { UpdateServiceProviderService } from '../services/update.serviceProvider.service';

@Controller('service_providers')
export class ServiceProvidersController {
  constructor(
    private findAllServiceProviderService: FindAllServiceProviderService,
    private findOneServiceProviderService: FindOneServiceProviderService,
    private createServiceProviderService: CreateServiceProviderService,
    private updateServiceProviderService: UpdateServiceProviderService,
    private deleteServiceProviderService: DeleteServiceProviderService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ServiceProvider))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationServiceProvidersQuery,
  ) {
    return this.findAllServiceProviderService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ServiceProvider))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedServiceProvidersQuery,
  ) {
    return this.findAllServiceProviderService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ServiceProvider))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneServiceProviderService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, ServiceProvider))
  @Post()
  async create(@Body() input: ServiceProviderDto, @Request() { user }: ICurrentUser) {
    return this.createServiceProviderService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, ServiceProvider))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: ServiceProviderDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateServiceProviderService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, ServiceProvider))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteServiceProviderService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
