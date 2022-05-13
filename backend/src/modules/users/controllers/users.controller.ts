import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import CheckPermissions from '@shared/providers/casl/decorators/checkPermissions.decorator';
import CaslActions from '@shared/providers/casl/enums/actions.casl.enum';
import PermissionsGuard from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { ChangePasswordUserDto } from '../dtos/changePassword.user.dto';
import { CreateUserDto } from '../dtos/createUser.dto';
import { UpdateUserDto } from '../dtos/updateUser.dto';
import { User } from '../entities/User';
import { FindAllLimitedUsersQuery } from '../query/findAllLimitedUsers.query';
import { FindAllUsersQuery } from '../query/findAllUsers.query';
import { CreateUserService } from '../services/createUser.service';
import { DeleteUserService } from '../services/deleteUser.service';
import { FindAllUserService } from '../services/findAllUser.service';
import { FindOneUserService } from '../services/findOneUser.service';
import { UpdateUserService } from '../services/updateUser.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(
    private findAllUserService: FindAllUserService,
    private findOneUserService: FindOneUserService,
    private createUserService: CreateUserService,
    private updateUserService: UpdateUserService,
    private deleteUserService: DeleteUserService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, User))
  @Get()
  async listUsers(@Request() { user }: ICurrentUser, @Query() query: FindAllUsersQuery) {
    return this.findAllUserService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, User))
  @Get('/limited')
  async listLimited(@Request() { user }: ICurrentUser, @Query() query: FindAllLimitedUsersQuery) {
    return this.findAllUserService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @Get('/me')
  async getMe(@Request() { user }: ICurrentUser) {
    return user;
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, User))
  @Get(':id')
  async getUser(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneUserService.execute({ id, organization_id: user.organization_id });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, User))
  @Post()
  async createUser(@Body() input: CreateUserDto, @Request() { user }: ICurrentUser) {
    return this.createUserService.execute({ ...input, organization_id: user.organization_id });
  }

  @Patch('/me/password')
  async changeMyPassword(@Body() input: ChangePasswordUserDto, @Request() { user }: ICurrentUser) {
    return this.updateUserService.change_password({
      ...input,
      id: user.id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, User))
  @Put(':id')
  async updateUser(
    @Param() { id }: IParamId,
    @Body() input: UpdateUserDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateUserService.execute({ id, ...input, currentUser: user });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, User))
  @HttpCode(204)
  @Delete(':id')
  async deleteUser(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteUserService.execute({ id, organization_id: user.organization_id });
  }
}
