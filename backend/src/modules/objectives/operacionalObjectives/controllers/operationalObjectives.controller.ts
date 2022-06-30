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

import { OperationalObjectiveDto } from '../dtos/operationalObjective.dto';
import { OperationalObjective } from '../entities/OperationalObjective';
import { FindAllLimitedOperationalObjectivesQuery } from '../query/findAllLimited.operationalObjective.query';
import { FindAllPaginationOperationalObjectivesQuery } from '../query/findAllPagination.operationalObjective.query';
import { CreateOperationalObjectiveService } from '../services/create.operationalObjective.service';
import { DeleteOperationalObjectiveService } from '../services/delete.operationalObjective.service';
import { FindAllOperationalObjectiveService } from '../services/findAll.operationalObjective.service';
import { FindOneOperationalObjectiveService } from '../services/findOne.operationalObjective.service';
import { UpdateOperationalObjectiveService } from '../services/update.operationalObjective.service';

@Controller('operational_objectives')
export class OperationalObjectivesController {
  constructor(
    private findAllOperationalObjectiveService: FindAllOperationalObjectiveService,
    private findOneOperationalObjectiveService: FindOneOperationalObjectiveService,
    private createOperationalObjectiveService: CreateOperationalObjectiveService,
    private updateOperationalObjectiveService: UpdateOperationalObjectiveService,
    private deleteOperationalObjectiveService: DeleteOperationalObjectiveService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, OperationalObjective))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationOperationalObjectivesQuery,
  ) {
    return this.findAllOperationalObjectiveService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, OperationalObjective))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedOperationalObjectivesQuery,
  ) {
    return this.findAllOperationalObjectiveService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, OperationalObjective))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneOperationalObjectiveService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, OperationalObjective))
  @Post()
  async create(@Body() input: OperationalObjectiveDto, @Request() { user }: ICurrentUser) {
    return this.createOperationalObjectiveService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, OperationalObjective))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: OperationalObjectiveDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateOperationalObjectiveService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, OperationalObjective))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteOperationalObjectiveService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
