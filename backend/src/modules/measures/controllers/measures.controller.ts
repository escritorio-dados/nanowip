import {
  Controller,
  UseGuards,
  Request,
  Get,
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

import { MeasureDto } from '../dtos/measure.dto';
import { Measure } from '../entities/Measure';
import { FindAllLimitedMeasuresQuery } from '../query/findAllLimited.measures.query';
import { FindAllPaginationMeasuresQuery } from '../query/findAllPagination.measures.query';
import { CreateMeasureService } from '../services/create.measure.service';
import { DeleteMeasureService } from '../services/delete.measure.service';
import { FindAllMeasureService } from '../services/findAll.measure.service';
import { FindOneMeasureService } from '../services/findOne.measure.service';
import { UpdateMeasureService } from '../services/update.measure.service';

@Controller('measures')
export class MeasuresController {
  constructor(
    private findAllMeasureService: FindAllMeasureService,
    private findOneMeasureService: FindOneMeasureService,
    private createMeasureService: CreateMeasureService,
    private updateMeasureService: UpdateMeasureService,
    private deleteMeasureService: DeleteMeasureService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Measure))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationMeasuresQuery,
  ) {
    return this.findAllMeasureService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Measure))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedMeasuresQuery,
  ) {
    return this.findAllMeasureService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Measure))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneMeasureService.execute({ id, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Measure))
  @Post()
  async create(@Body() input: MeasureDto, @Request() { user }: ICurrentUser) {
    return this.createMeasureService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Measure))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: MeasureDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateMeasureService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Measure))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    const deleted = await this.deleteMeasureService.execute({
      id,
      organization_id: user.organization_id,
    });

    return deleted;
  }
}
