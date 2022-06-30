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

import { IntegratedObjectiveDto } from '../dtos/integratedObjective.dto';
import { IntegratedObjective } from '../entities/IntegratedObjective';
import { FindAllLimitedIntegratedObjectivesQuery } from '../query/findAllLimited.integratedObjective.query';
import { FindAllPaginationIntegratedObjectivesQuery } from '../query/findAllPagination.integratedObjective.query';
import { CreateIntegratedObjectiveService } from '../services/create.integratedObjective.service';
import { DeleteIntegratedObjectiveService } from '../services/delete.integratedObjective.service';
import { FindAllIntegratedObjectiveService } from '../services/findAll.integratedObjective.service';
import { FindOneIntegratedObjectiveService } from '../services/findOne.integratedObjective.service';
import { UpdateIntegratedObjectiveService } from '../services/update.integratedObjective.service';

@Controller('integrated_objectives')
export class IntegratedObjectivesController {
  constructor(
    private findAllIntegratedObjectiveService: FindAllIntegratedObjectiveService,
    private findOneIntegratedObjectiveService: FindOneIntegratedObjectiveService,
    private createIntegratedObjectiveService: CreateIntegratedObjectiveService,
    private updateIntegratedObjectiveService: UpdateIntegratedObjectiveService,
    private deleteIntegratedObjectiveService: DeleteIntegratedObjectiveService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, IntegratedObjective))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationIntegratedObjectivesQuery,
  ) {
    return this.findAllIntegratedObjectiveService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, IntegratedObjective))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedIntegratedObjectivesQuery,
  ) {
    return this.findAllIntegratedObjectiveService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, IntegratedObjective))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneIntegratedObjectiveService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, IntegratedObjective))
  @Post()
  async create(@Body() input: IntegratedObjectiveDto, @Request() { user }: ICurrentUser) {
    return this.createIntegratedObjectiveService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, IntegratedObjective))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: IntegratedObjectiveDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateIntegratedObjectiveService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, IntegratedObjective))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteIntegratedObjectiveService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
