import {
  Controller,
  UseGuards,
  Request,
  Query,
  Get,
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

import { CollaboratorDto } from '../dtos/collaborator.dto';
import { Collaborator } from '../entities/Collaborator';
import { FindAllLimitedCollaboratorsQuery } from '../query/findAllLimited.collaborators.query';
import { FindAllPaginationCollaboratorsQuery } from '../query/findAllPagination.collaborators.query';
import { CreateCollaboratorService } from '../services/create.collaborator.service';
import { DeleteCollaboratorService } from '../services/delete.collaborator.service';
import { FindAllCollaboratorService } from '../services/findAll.collaborator.service';
import { FindOneCollaboratorService } from '../services/findOne.collaborator.service';
import { UpdateCollaboratorService } from '../services/update.collaborator.service';

@Controller('collaborators')
export class CollaboratorController {
  constructor(
    private findAllCollaboratorService: FindAllCollaboratorService,
    private findOneCollaboratorService: FindOneCollaboratorService,
    private createCollaboratorService: CreateCollaboratorService,
    private updateCollaboratorService: UpdateCollaboratorService,
    private deleteCollaboratorService: DeleteCollaboratorService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Collaborator))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationCollaboratorsQuery,
  ) {
    return this.findAllCollaboratorService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Collaborator))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedCollaboratorsQuery,
  ) {
    return this.findAllCollaboratorService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Collaborator))
  @Get('/limited/trackers')
  async findAllLimitedTrackers(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedCollaboratorsQuery,
  ) {
    return this.findAllCollaboratorService.findAllLimited({
      organization_id: user.organization_id,
      query,
      onlyTrackers: true,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(
    ability => ability.can(CaslActions.read, Collaborator),
    ability => ability.can(CaslActions.personal, Collaborator),
  )
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneCollaboratorService.getInfo({
      id,
      organization_id: user.organization_id,
      user,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Collaborator))
  @Post()
  async create(@Body() input: CollaboratorDto, @Request() { user }: ICurrentUser) {
    return this.createCollaboratorService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Collaborator))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: CollaboratorDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateCollaboratorService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Collaborator))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    const deleted = await this.deleteCollaboratorService.execute({
      id,
      organization_id: user.organization_id,
    });

    return deleted;
  }
}
