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

import { CheckPermissions } from '@shared/providers/casl/decorators/checkPermissions.decorator';
import { CaslActions } from '@shared/providers/casl/enums/actions.casl.enum';
import { PermissionsGuard } from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { CostDto } from '../dtos/cost.dto';
import { Cost } from '../entities/Cost';
import { FindPaginationCostQuery } from '../query/findPagination.cost.query';
import { FindPaginationDistributionCostQuery } from '../query/findPaginationDistribution.cost.query';
import { CreateCostService } from '../services/create.cost.service';
import { DeleteCostService } from '../services/delete.cost.service';
import { FindAllCostService } from '../services/findAll.cost.service';
import { FindOneCostService } from '../services/findOne.cost.service';
import { RecalculatePercentCostService } from '../services/recalculatePercent.cost.service';
import { UpdateCostService } from '../services/update.cost.service';

@Controller('costs')
export class CostsController {
  constructor(
    private findAllCostService: FindAllCostService,
    private findOneCostService: FindOneCostService,
    private createCostService: CreateCostService,
    private updateCostService: UpdateCostService,
    private deleteCostService: DeleteCostService,
    private recalculatePercentCostService: RecalculatePercentCostService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Cost))
  @Get()
  async findPagination(@Request() { user }: ICurrentUser, @Query() query: FindPaginationCostQuery) {
    return this.findAllCostService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Cost))
  @Get('/distribution')
  async findPaginationDistribution(
    @Request() { user }: ICurrentUser,
    @Query() query: FindPaginationDistributionCostQuery,
  ) {
    return this.findAllCostService.findAllPaginationDistribution({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Cost))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneCostService.getInfo({ id, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Cost))
  @Post()
  async create(@Body() input: CostDto, @Request() { user }: ICurrentUser) {
    return this.createCostService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Cost))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: CostDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateCostService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Cost))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteCostService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Cost))
  @HttpCode(204)
  @Post('/recalculate_percent')
  async recalculatePercent(@Request() { user }: ICurrentUser) {
    await this.recalculatePercentCostService.execute({
      organization_id: user.organization_id,
    });
  }
}
