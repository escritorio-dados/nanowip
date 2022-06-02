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

import { CheckPermissions } from '@shared/providers/casl/decorators/checkPermissions.decorator';
import { CaslActions } from '@shared/providers/casl/enums/actions.casl.enum';
import { PermissionsGuard } from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { ChangeStatusAssignmentDto } from '../dtos/changeStatus.assignment.dto';
import { CreateAssignmentDto } from '../dtos/createAssignment.dto';
import { UpdateAssignmentDto } from '../dtos/updateAssignment.dto';
import { Assignment } from '../entities/Assignment';
import { FindAllLimitedAssignmentsQuery } from '../query/findAllLimited.assignment.query';
import { FindByTaskAssignmentQuery } from '../query/findByTask.assignment.query';
import { FindPaginationAssignmentQuery } from '../query/findPagination.assignment.query';
import { FindPaginationCloseAssignmentQuery } from '../query/findPaginationClose.assignment.query';
import { FindPersonalLimitedAssignmentsQuery } from '../query/findPersonalLimited.assignment.query';
import { CreateAssignmentService } from '../services/create.assignment.service';
import { DeleteAssignmentService } from '../services/delete.assignment.service';
import { FindAllAssignmentService } from '../services/findAll.assignment.service';
import { FindOneAssignmentService } from '../services/findOne.assignment.service';
import { RecalculateDatesAssignmentService } from '../services/recalculateDates.assignment.service';
import { UpdateAssignmentService } from '../services/update.assignment.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(
    private findAllAssignmentService: FindAllAssignmentService,
    private findOneAssignmentService: FindOneAssignmentService,
    private createAssignmentService: CreateAssignmentService,
    private updateAssignmentService: UpdateAssignmentService,
    private deleteAssignmentService: DeleteAssignmentService,
    private recalculateDatesAssignmentsService: RecalculateDatesAssignmentService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Assignment))
  @Get()
  async listPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindPaginationAssignmentQuery,
  ) {
    return this.findAllAssignmentService.findAllPagination({
      query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Assignment))
  @Get('/limited/open')
  async listLimitedOpen(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedAssignmentsQuery,
  ) {
    return this.findAllAssignmentService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.personal, Assignment))
  @Get('/personal/limited/open')
  async listLimitedOpenPersonal(
    @Request() { user }: ICurrentUser,
    @Query() query: FindPersonalLimitedAssignmentsQuery,
  ) {
    return this.findAllAssignmentService.findAllLimited({
      organization_id: user.organization_id,
      collaborator_id: user.collaborator.id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.personal, Assignment))
  @Get('/personal/available')
  async listAvailablePersonal(@Request() { user }: ICurrentUser) {
    return this.findAllAssignmentService.findAvailablePersonal({ user });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.personal, Assignment))
  @Get('/personal/closed')
  async listClosedPersonal(
    @Request() { user }: ICurrentUser,
    @Query() query: FindPaginationCloseAssignmentQuery,
  ) {
    return this.findAllAssignmentService.findClosedPersonal({ user, query });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, Assignment))
  @Get('/task')
  async listByTask(@Request() { user }: ICurrentUser, @Query() query: FindByTaskAssignmentQuery) {
    return this.findAllAssignmentService.findAllByTask({
      ...query,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(
    ability => ability.can(CaslActions.read, Assignment),
    ability => ability.can(CaslActions.personal, Assignment),
  )
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneAssignmentService.getInfo({
      id,
      user,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, Assignment))
  @Post()
  async create(@Body() input: CreateAssignmentDto, @Request() { user }: ICurrentUser) {
    return this.createAssignmentService.execute({
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, Assignment))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: UpdateAssignmentDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateAssignmentService.execute({
      id,
      ...input,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.personal, Assignment))
  @Put('/personal/:id')
  async changeStatus(
    @Param() { id }: IParamId,
    @Body() input: ChangeStatusAssignmentDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateAssignmentService.personalChangeStatus({
      id,
      ...input,
      user,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, Assignment))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteAssignmentService.execute({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.manage, 'admin'))
  @HttpCode(204)
  @Post('/recalculate_dates')
  async recalculateDates(@Request() { user }: ICurrentUser) {
    await this.recalculateDatesAssignmentsService.recalculateDates(user.organization_id);
  }
}
