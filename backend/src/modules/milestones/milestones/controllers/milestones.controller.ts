import { Controller, Get, Request, Param, Body, Put, HttpCode, Delete } from '@nestjs/common';

import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { MilestoneDto } from '@modules/milestones/milestones/dtos/milestone.dto';

import { DeleteMilestoneService } from '../services/delete.milestone.service';
import { FindOneMilestoneService } from '../services/findOne.milestone.service';
import { UpdateMilestoneService } from '../services/update.milestone.service';

@Controller('milestones')
export class MilestonesController {
  constructor(
    private findOneMilestoneService: FindOneMilestoneService,
    private updateMilestoneService: UpdateMilestoneService,
    private deleteMilestoneService: DeleteMilestoneService,
  ) {}

  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneMilestoneService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: MilestoneDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateMilestoneService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteMilestoneService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
