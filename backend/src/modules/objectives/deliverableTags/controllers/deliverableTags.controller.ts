import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  Post,
  Body,
  Put,
  HttpCode,
  Delete,
  Query,
} from '@nestjs/common';

import { CheckPermissions } from '@shared/providers/casl/decorators/checkPermissions.decorator';
import { CaslActions } from '@shared/providers/casl/enums/actions.casl.enum';
import { PermissionsGuard } from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { MilestoneDto } from '@modules/milestones/milestones/dtos/milestone.dto';
import { Deliverable } from '@modules/objectives/deliverables/entities/Deliverable';

import { CreateDeliverableTagDto } from '../dtos/create.deliverableTag.dto';
import { UpdateDeliverableTagDto } from '../dtos/update.deliverableTag.dto';
import { FindByCategoryDeliverableQuery } from '../query/findByCategory.deliverableTag.query';
import { CreateDeliverableTagService } from '../services/create.deliverableTag.service';
import { DeleteDeliverableTagService } from '../services/delete.deliverableTag.service';
import { FindAllDeliverableTagService } from '../services/findAll.deliverableTag.service';
import { FindOneDeliverableTagService } from '../services/findOne.deliverableTag.service';
import { MilestonesDeliverableTagService } from '../services/milestones.deliverableTag.service';
import { UpdateDeliverableTagService } from '../services/update.deliverableTag.service';

@Controller('deliverable_tags')
export class DeliverableTagsController {
  constructor(
    private findAllDeliverableTagService: FindAllDeliverableTagService,
    private findOneDeliverableTagService: FindOneDeliverableTagService,
    private createDeliverableTagService: CreateDeliverableTagService,
    private updateDeliverableTagService: UpdateDeliverableTagService,
    private deleteDeliverableTagService: DeleteDeliverableTagService,

    private milestonesDeliverableTagService: MilestonesDeliverableTagService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Deliverable))
  @Get('/')
  async findBySection(
    @Request() { user }: ICurrentUser,
    @Query() query: FindByCategoryDeliverableQuery,
  ) {
    return this.findAllDeliverableTagService.findAllByCategory({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Deliverable))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneDeliverableTagService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @Get(':id/milestones')
  async getMilestones(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.milestonesDeliverableTagService.list({
      deliverable_id: id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Deliverable))
  @Post()
  async create(@Body() input: CreateDeliverableTagDto, @Request() { user }: ICurrentUser) {
    return this.createDeliverableTagService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @Post(':id/milestones')
  async createMilestones(
    @Param() { id }: IParamId,
    @Body() input: MilestoneDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.milestonesDeliverableTagService.create({
      deliverable_id: id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Deliverable))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateDeliverableTagDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateDeliverableTagService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Deliverable))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteDeliverableTagService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
