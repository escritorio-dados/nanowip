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

import { CreateCostDistributionDto } from '../dtos/create.costDistribution.dto';
import { UpdateCostDistributionDto } from '../dtos/update.costDistribution.dto';
import { CostDistribution } from '../entities/CostDistribution';
import { FindByCostCostDistributionQuery } from '../query/FindByCost.costDistribution.query';
import { CreateCostDistributionService } from '../service/create.costDistribution.service';
import { DeleteCostDistributionService } from '../service/delete.costDistribution.service';
import { FindAllCostDistributionService } from '../service/findAll.costDistribution.service';
import { FindOneCostDistributionService } from '../service/findOne.costDistribution.service';
import { UpdateCostDistributionService } from '../service/update.costDistribution.service';

@Controller('cost_distributions')
export class CostDistributionsController {
  constructor(
    private findAllCostDistributionService: FindAllCostDistributionService,
    private findOneCostDistributionService: FindOneCostDistributionService,
    private createCostDistributionService: CreateCostDistributionService,
    private updateCostDistributionService: UpdateCostDistributionService,
    private deleteCostDistributionService: DeleteCostDistributionService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, CostDistribution))
  @Get()
  async findByCost(
    @Request() { user }: ICurrentUser,
    @Query() query: FindByCostCostDistributionQuery,
  ) {
    return this.findAllCostDistributionService.findAllByCost({
      ...query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, CostDistribution))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneCostDistributionService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, CostDistribution))
  @Post()
  async create(@Body() input: CreateCostDistributionDto, @Request() { user }: ICurrentUser) {
    return this.createCostDistributionService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, CostDistribution))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateCostDistributionDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateCostDistributionService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, CostDistribution))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteCostDistributionService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
