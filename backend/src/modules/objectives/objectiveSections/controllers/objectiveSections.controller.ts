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

import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';

import { CreateObjectiveSectionDto } from '../dtos/create.objectiveSection.dto';
import { UpdateObjectiveSectionDto } from '../dtos/update.objectiveSection.dto';
import { UpdatePositionsObjectiveSectionDto } from '../dtos/updatePositions.objectiveSection.dto';
import { FindByCategoryObjectiveSectionQuery } from '../query/findByCategory.objectiveSection.query';
import { CreateObjectiveSectionService } from '../services/create.objectiveSection.service';
import { DeleteObjectiveSectionService } from '../services/delete.objectiveSection.service';
import { FindAllObjectiveSectionService } from '../services/findAll.objectiveSection.service';
import { FindOneObjectiveSectionService } from '../services/findOne.objectiveSection.service';
import { UpdateObjectiveSectionService } from '../services/update.objectiveSection.service';

@Controller('objective_sections')
export class ObjectiveSectionsController {
  constructor(
    private findAllObjectiveSectionService: FindAllObjectiveSectionService,
    private findOneObjectiveSectionService: FindOneObjectiveSectionService,
    private createObjectiveSectionService: CreateObjectiveSectionService,
    private updateObjectiveSectionService: UpdateObjectiveSectionService,
    private deleteObjectiveSectionService: DeleteObjectiveSectionService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ObjectiveCategory))
  @Get('/')
  async findByObjective(
    @Request() { user }: ICurrentUser,
    @Query() query: FindByCategoryObjectiveSectionQuery,
  ) {
    return this.findAllObjectiveSectionService.findAllByCategory({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ObjectiveCategory))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneObjectiveSectionService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, ObjectiveCategory))
  @Post()
  async create(@Body() input: CreateObjectiveSectionDto, @Request() { user }: ICurrentUser) {
    return this.createObjectiveSectionService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, ObjectiveCategory))
  @HttpCode(204)
  @Put('/sort')
  async sort(@Body() input: UpdatePositionsObjectiveSectionDto, @Request() { user }: ICurrentUser) {
    await this.updateObjectiveSectionService.updatePositions({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, ObjectiveCategory))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateObjectiveSectionDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateObjectiveSectionService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, ObjectiveCategory))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteObjectiveSectionService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
