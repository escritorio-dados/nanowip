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

import { CreateTrackerDto } from '../dtos/create.tracker.dto';
import { CreatePersonalTrackerDto } from '../dtos/createPersonal.tracker.dto';
import { StartTrackerDto } from '../dtos/start.tracker.dto';
import { UpdateTrackerDto } from '../dtos/update.tracker.dto';
import { Tracker } from '../entities/Tracker';
import { FindPaginationTrackerQuery } from '../query/findPagination.tracker.query';
import { FindPersonalTrackerQuery } from '../query/findPersonal.tracker.query';
import { CreateTrackerService } from '../services/create.tracker.service';
import { DeleteTrackerService } from '../services/delete.tracker.service';
import { FindAllTrackerService } from '../services/findAll.tracker.service';
import { FindOneTrackerService } from '../services/findOne.tracker.service';
import { UpdateTrackerService } from '../services/update.tracker.service';

@Controller('trackers')
export class TrackersController {
  constructor(
    private findAllTrackerService: FindAllTrackerService,
    private findOneTrackerService: FindOneTrackerService,
    private createTrackerService: CreateTrackerService,
    private updateTrackerService: UpdateTrackerService,
    private deleteTrackerService: DeleteTrackerService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Tracker))
  @Get()
  async listPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindPaginationTrackerQuery,
  ) {
    return this.findAllTrackerService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.personal, Tracker))
  @Get('/personal')
  async listPersonal(@Request() { user }: ICurrentUser, @Query() query: FindPersonalTrackerQuery) {
    return this.findAllTrackerService.findAllPersonal({
      query,
      user,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.personal, Tracker))
  @Get('/active')
  async getActive(@Request() { user }: ICurrentUser) {
    return this.findOneTrackerService.getActive(user);
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(
    ability => ability.can(CaslActions.read, Tracker),
    ability => ability.can(CaslActions.personal, Tracker),
  )
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneTrackerService.getInfo({ id, user, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Tracker))
  @Post()
  async create(@Body() input: CreateTrackerDto, @Request() { user }: ICurrentUser) {
    return this.createTrackerService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.personal, Tracker))
  @Post('/personal')
  async createPersonal(@Body() input: CreatePersonalTrackerDto, @Request() { user }: ICurrentUser) {
    return this.createTrackerService.createPersonal({
      ...input,
      user,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.personal, Tracker))
  @Post('/start')
  async start(@Body() input: StartTrackerDto, @Request() { user }: ICurrentUser) {
    return this.createTrackerService.startTracker({
      ...input,
      user,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.personal, Tracker))
  @Put('/stop/:id')
  async stop(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.updateTrackerService.stopTracker(id, user);
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(
    ability => ability.can(CaslActions.update, Tracker),
    ability => ability.can(CaslActions.personal, Tracker),
  )
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateTrackerDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateTrackerService.execute({
      id,
      ...input,
      user,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(
    ability => ability.can(CaslActions.delete, Tracker),
    ability => ability.can(CaslActions.personal, Tracker),
  )
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteTrackerService.execute({
      id,
      user,
      organization_id: user.organization_id,
    });
  }
}
