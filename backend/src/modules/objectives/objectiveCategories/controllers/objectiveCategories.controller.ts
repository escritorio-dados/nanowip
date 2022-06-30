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

import { ObjectiveCategoryDto } from '../dtos/objectiveCategory.dto';
import { UpdatePositionsObjectiveCategoryDto } from '../dtos/updatePositions.objectiveCategory.dto';
import { ObjectiveCategory } from '../entities/ObjectiveCategory';
import { FindByObjectiveObjectiveCategoryQuery } from '../query/findByObjective.objectiveCategory.query';
import { CreateObjectiveCategoryService } from '../services/create.objectiveCategory.service';
import { DeleteObjectiveCategoryService } from '../services/delete.objectiveCategory.service';
import { FindAllObjectiveCategoryService } from '../services/findAll.objectiveCategory.service';
import { FindOneObjectiveCategoryService } from '../services/findOne.objectiveCategory.service';
import { UpdateObjectiveCategoryService } from '../services/update.objectiveCategory.service';

@Controller('objective_categories')
export class ObjectiveCategoriesController {
  constructor(
    private findAllObjectiveCategoryService: FindAllObjectiveCategoryService,
    private findOneObjectiveCategoryService: FindOneObjectiveCategoryService,
    private createObjectiveCategoryService: CreateObjectiveCategoryService,
    private updateObjectiveCategoryService: UpdateObjectiveCategoryService,
    private deleteObjectiveCategoryService: DeleteObjectiveCategoryService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ObjectiveCategory))
  @Get('/')
  async findByObjective(
    @Request() { user }: ICurrentUser,
    @Query() query: FindByObjectiveObjectiveCategoryQuery,
  ) {
    return this.findAllObjectiveCategoryService.findAllByObjective({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, ObjectiveCategory))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneObjectiveCategoryService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, ObjectiveCategory))
  @Post()
  async create(@Body() input: ObjectiveCategoryDto, @Request() { user }: ICurrentUser) {
    return this.createObjectiveCategoryService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, ObjectiveCategory))
  @HttpCode(204)
  @Put('/sort')
  async sort(
    @Body() input: UpdatePositionsObjectiveCategoryDto,
    @Request() { user }: ICurrentUser,
  ) {
    await this.updateObjectiveCategoryService.updatePositions({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, ObjectiveCategory))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: ObjectiveCategoryDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateObjectiveCategoryService.execute({
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
    await this.deleteObjectiveCategoryService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
