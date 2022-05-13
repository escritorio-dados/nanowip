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

import { PortfolioDto } from '../dtos/portfolio.dto';
import { Portfolio } from '../entities/Portfolio';
import { FindAllLimitedPortfoliosQuery } from '../query/findAllLimited.portfolios.query';
import { FindAllPaginationPortifoliosQuery } from '../query/findAllPaginationPortfolios.query';
import { CreatePortfolioService } from '../services/create.portfolio.service';
import { DeletePortfolioService } from '../services/delete.portfolio.service';
import { FindAllPortfolioService } from '../services/findAll.portfolio.service';
import { FindOnePortfolioService } from '../services/findOne.portfolio.service';
import { UpdatePortfolioService } from '../services/update.portfolio.service';

@Controller('portfolios')
export class PortfoliosController {
  constructor(
    private findAllPortfolioService: FindAllPortfolioService,
    private findOnePortfolioService: FindOnePortfolioService,
    private createPortfolioService: CreatePortfolioService,
    private updatePortfolioService: UpdatePortfolioService,
    private deletePortfolioService: DeletePortfolioService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Portfolio))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationPortifoliosQuery,
  ) {
    return this.findAllPortfolioService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Portfolio))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedPortfoliosQuery,
  ) {
    return this.findAllPortfolioService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Portfolio))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOnePortfolioService.findWithProjects({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Portfolio))
  @Post()
  async create(@Body() input: PortfolioDto, @Request() { user }: ICurrentUser) {
    return this.createPortfolioService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Portfolio))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: PortfolioDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updatePortfolioService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Portfolio))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deletePortfolioService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
