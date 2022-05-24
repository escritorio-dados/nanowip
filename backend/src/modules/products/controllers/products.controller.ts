import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Param,
  Body,
  Post,
  Put,
  HttpCode,
  Delete,
} from '@nestjs/common';

import CheckPermissions from '@shared/providers/casl/decorators/checkPermissions.decorator';
import CaslActions from '@shared/providers/casl/enums/actions.casl.enum';
import PermissionsGuard from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/Product';
import { FindAllLimitedProductsQuery } from '../query/findAllLimited.product.query';
import { FindPaginationProductQuery } from '../query/findPagination.product.query';
import { ReportProductQuery } from '../query/report.product.query';
import { CreateProductService } from '../services/create.product.service';
import { DeleteProductService } from '../services/delete.product.service';
import { FindAllProductService } from '../services/findAll.product.service';
import { FindOneProductService } from '../services/findOne.product.service';
import { RecalculateDatesProductService } from '../services/recalculateDates.product.service';
import { UpdateProductService } from '../services/update.product.service';

@Controller('products')
export class ProductsController {
  constructor(
    private findAllProductService: FindAllProductService,
    private findOneProductService: FindOneProductService,
    private createProductService: CreateProductService,
    private updateProductService: UpdateProductService,
    private deleteProductService: DeleteProductService,
    private recalculateDatesProductService: RecalculateDatesProductService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Product))
  @Get()
  async findPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindPaginationProductQuery,
  ) {
    return this.findAllProductService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Product))
  @Get('/report')
  async getReport(@Request() { user }: ICurrentUser, @Query() query: ReportProductQuery) {
    return this.findAllProductService.findReport({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Product))
  @Get('/limited/root')
  async findAllLimitedRoot(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedProductsQuery,
  ) {
    return this.findAllProductService.findAllLimitedRoot({
      organization_id: user.organization_id,
      query,
      onlyRoot: true,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Product))
  @Get('/limited/all')
  async findAllLimitedAll(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedProductsQuery,
  ) {
    return this.findAllProductService.findAllLimitedRoot({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Product))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneProductService.getInfo({ id, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Product))
  @Post()
  async create(@Body() input: ProductDto, @Request() { user }: ICurrentUser) {
    return this.createProductService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Product))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: ProductDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateProductService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Product))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteProductService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @HttpCode(204)
  @Post('/recalculate_dates')
  async recalculateDates(@Request() { user }: ICurrentUser) {
    await this.recalculateDatesProductService.recalculateDates({
      organization_id: user.organization_id,
    });
  }
}
