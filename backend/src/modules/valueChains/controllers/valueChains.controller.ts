import {
  Controller,
  UseGuards,
  Request,
  Get,
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

import { ValueChainDto } from '../dtos/create.valueChain.dto';
import { RecalculateDatesValueChainDto } from '../dtos/recalculateDates.valueChain.dto';
import { ValueChain } from '../entities/ValueChain';
import { FindAllLimitedValueChainsQuery } from '../query/findAllLimited.valueChains.query';
import { FindAllPaginationValueChainsQuery } from '../query/findAllPagination.valueChains.query';
import { FindOneValueChainsQuery } from '../query/findOne.valueChains.query';
import { CreateValueChainService } from '../services/create.valueChain.service';
import { DeleteValueChainService } from '../services/delete.valueChain.service';
import { FindAllValueChainService } from '../services/findAll.valueChain.service';
import { FindOneValueChainService } from '../services/findOne.valueChain.service';
import { RecalculateDatesValueChainService } from '../services/recalculateDates.valueChain.service';
import { UpdateValueChainService } from '../services/update.valueChain.service';

@Controller('value_chains')
export class ValueChainsController {
  constructor(
    private findAllValueChainService: FindAllValueChainService,
    private findOneValueChainService: FindOneValueChainService,
    private createValueChainService: CreateValueChainService,
    private updateValueChainService: UpdateValueChainService,
    private deleteValueChainService: DeleteValueChainService,
    private recalculateDatesValueChainsService: RecalculateDatesValueChainService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ValueChain))
  @Get()
  async findPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationValueChainsQuery,
  ) {
    return this.findAllValueChainService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ValueChain))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedValueChainsQuery,
  ) {
    return this.findAllValueChainService.findAllLimited({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ValueChain))
  @Get(':id')
  async get(
    @Param() { id }: IParamId,
    @Request() { user }: ICurrentUser,
    @Query() query: FindOneValueChainsQuery,
  ) {
    return this.findOneValueChainService.getInfo({
      id,
      ...query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, ValueChain))
  @Post()
  async create(@Body() input: ValueChainDto, @Request() { user }: ICurrentUser) {
    return this.createValueChainService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, ValueChain))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: ValueChainDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateValueChainService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, ValueChain))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteValueChainService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @HttpCode(204)
  @Post('/recalculate_dates')
  async recalculateDates(
    @Request() { user }: ICurrentUser,
    @Body() input: RecalculateDatesValueChainDto,
  ) {
    await this.recalculateDatesValueChainsService.recalculateDates({
      ...input,
      organization_id: user.organization_id,
    });
  }
}
