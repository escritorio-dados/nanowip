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

import CheckPermissions from '@shared/providers/casl/decorators/checkPermissions.decorator';
import CaslActions from '@shared/providers/casl/enums/actions.casl.enum';
import PermissionsGuard from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { CollaboratorStatusDto } from '../dtos/collaboratorStatus.dto';
import { CollaboratorStatus } from '../entities/CollaboratorStatus';
import { FindAllPaginationCollaboratorsStatusQuery } from '../query/findAllPagination.collaboratorsStatus.query';
import { CreateCollaboratorStatusService } from '../services/create.collaboratorStatus.service';
import { DeleteCollaboratorStatusService } from '../services/delete.collaboratorStatus.service';
import { FindAllCollaboratorStatusService } from '../services/findAll.collaboratorStatus.service';
import { FindOneCollaboratorStatusService } from '../services/findOne.collaboratorStatus.service';
import { UpdateCollaboratorStatusService } from '../services/update.collaboratorStatus.service';

@Controller('collaborators_status')
export class CollaboratorStatusController {
  constructor(
    private findAllCollaboratorStatusService: FindAllCollaboratorStatusService,
    private findOneCollaboratorStatusService: FindOneCollaboratorStatusService,
    private createCollaboratorStatusService: CreateCollaboratorStatusService,
    private updateCollaboratorStatusService: UpdateCollaboratorStatusService,
    private deleteCollaboratorStatusService: DeleteCollaboratorStatusService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, CollaboratorStatus))
  @Get()
  async findPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationCollaboratorsStatusQuery,
  ) {
    return this.findAllCollaboratorStatusService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, CollaboratorStatus))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneCollaboratorStatusService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, CollaboratorStatus))
  @Post()
  async create(@Body() input: CollaboratorStatusDto, @Request() { user }: ICurrentUser) {
    return this.createCollaboratorStatusService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, CollaboratorStatus))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: CollaboratorStatusDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateCollaboratorStatusService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, CollaboratorStatus))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteCollaboratorStatusService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
