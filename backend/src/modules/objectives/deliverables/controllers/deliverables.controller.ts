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
  Patch,
  Query,
} from '@nestjs/common';

import { CheckPermissions } from '@shared/providers/casl/decorators/checkPermissions.decorator';
import { CaslActions } from '@shared/providers/casl/enums/actions.casl.enum';
import { PermissionsGuard } from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { ChangeSectionDeliverableDto } from '../dtos/changeSection.deliverable.dto';
import { CreateDeliverableDto } from '../dtos/create.deliverable.dto';
import { UpdateDeliverableDto } from '../dtos/update.deliverable.dto';
import { UpdatePositionsDeliverableDto } from '../dtos/updatePositions.deliverable.dto';
import { Deliverable } from '../entities/Deliverable';
import { FindBySectionDeliverableQuery } from '../query/findBySection.deliverable.query';
import { CreateDeliverableService } from '../services/create.deliverable.service';
import { DeleteDeliverableService } from '../services/delete.deliverable.service';
import { FindAllDeliverableService } from '../services/findAll.deliverable.service';
import { FindOneDeliverableService } from '../services/findOne.deliverable.service';
import { UpdateDeliverableService } from '../services/update.deliverable.service';

@Controller('deliverables')
export class DeliverablesController {
  constructor(
    private findAllDeliverableService: FindAllDeliverableService,
    private findOneDeliverableService: FindOneDeliverableService,
    private createDeliverableService: CreateDeliverableService,
    private updateDeliverableService: UpdateDeliverableService,
    private deleteDeliverableService: DeleteDeliverableService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Deliverable))
  @Get('/')
  async findBySection(
    @Request() { user }: ICurrentUser,
    @Query() query: FindBySectionDeliverableQuery,
  ) {
    return this.findAllDeliverableService.findAllBySection({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Deliverable))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneDeliverableService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Deliverable))
  @Post()
  async create(@Body() input: CreateDeliverableDto, @Request() { user }: ICurrentUser) {
    return this.createDeliverableService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Deliverable))
  @HttpCode(204)
  @Put('/sort')
  async sort(@Body() input: UpdatePositionsDeliverableDto, @Request() { user }: ICurrentUser) {
    await this.updateDeliverableService.updatePositions({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Deliverable))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateDeliverableDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateDeliverableService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Deliverable))
  @Patch(':id/change_section')
  async changeSection(
    @Param() { id }: IParamId,
    @Body() input: ChangeSectionDeliverableDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateDeliverableService.changeSection({
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
    await this.deleteDeliverableService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
