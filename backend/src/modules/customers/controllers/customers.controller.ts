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

import { CustomerDto } from '../dtos/customer.dto';
import { Customer } from '../entities/Customer';
import { FindAllLimitedCustomersQuery } from '../query/findAllLimited.customers.query';
import { FindAllPaginationCustomersQuery } from '../query/findAllPagination.customers.query';
import { CreateCustomerService } from '../services/create.customer.service';
import { DeleteCustomerService } from '../services/delete.customer.service';
import { FindAllCustomerService } from '../services/findAll.customer.service';
import { FindOneCustomerService } from '../services/findOne.customer.service';
import { UpdateCustomerService } from '../services/update.customer.service';

@Controller('customers')
export class CustomersController {
  constructor(
    private findAllCustomerService: FindAllCustomerService,
    private findOneCustomerService: FindOneCustomerService,
    private createCustomerService: CreateCustomerService,
    private updateCustomerService: UpdateCustomerService,
    private deleteCustomerService: DeleteCustomerService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Customer))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationCustomersQuery,
  ) {
    return this.findAllCustomerService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Customer))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedCustomersQuery,
  ) {
    return this.findAllCustomerService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Customer))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneCustomerService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Customer))
  @Post()
  async create(@Body() input: CustomerDto, @Request() { user }: ICurrentUser) {
    return this.createCustomerService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Customer))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: CustomerDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateCustomerService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Customer))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteCustomerService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
