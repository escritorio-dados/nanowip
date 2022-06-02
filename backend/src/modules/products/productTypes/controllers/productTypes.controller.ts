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

import { ProductTypeDto } from '../dtos/productType.dto';
import { ProductType } from '../entities/ProductType';
import { FindAllLimitedProductTypesQuery } from '../query/findAllLimited.productTypes.query';
import { FindAllPaginationProductTypesQuery } from '../query/findAllPagination.productTypes.query';
import { CreateProductTypeService } from '../services/create.productType.service';
import { DeleteProductTypeService } from '../services/delete.productType.service';
import { FindAllProductTypeService } from '../services/findAll.productType.service';
import { FindOneProductTypeService } from '../services/findOne.productType.service';
import { UpdateProductTypeService } from '../services/update.productType.service';

@Controller('product_types')
export class ProductTypesController {
  constructor(
    private findAllProductTypeService: FindAllProductTypeService,
    private findOneProductTypeService: FindOneProductTypeService,
    private createProductTypeService: CreateProductTypeService,
    private updateProductTypeService: UpdateProductTypeService,
    private deleteProductTypeService: DeleteProductTypeService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ProductType))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationProductTypesQuery,
  ) {
    return this.findAllProductTypeService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ProductType))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedProductTypesQuery,
  ) {
    return this.findAllProductTypeService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ProductType))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneProductTypeService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, ProductType))
  @Post()
  async create(@Body() input: ProductTypeDto, @Request() { user }: ICurrentUser) {
    return this.createProductTypeService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, ProductType))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: ProductTypeDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateProductTypeService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, ProductType))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    const deleted = await this.deleteProductTypeService.execute({
      id,
      organization_id: user.organization_id,
    });

    return deleted;
  }
}
