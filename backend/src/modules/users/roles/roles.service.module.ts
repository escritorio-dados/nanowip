import { Module } from '@nestjs/common';

import { RolesRepositoryModule } from './roles.repository.module';
import { CommonRoleService } from './services/commonRole.service';
import { CreateRoleService } from './services/createRole.service';
import { DeleteRoleService } from './services/deleteRole.service';
import { FindAllRoleService } from './services/findAllRole.service';
import { FindOneRoleService } from './services/findOneRole.service';
import { UpdateRoleService } from './services/updateRole.service';

@Module({
  imports: [RolesRepositoryModule],
  providers: [
    CommonRoleService,
    FindAllRoleService,
    FindOneRoleService,
    CreateRoleService,
    UpdateRoleService,
    DeleteRoleService,
  ],
  exports: [
    FindAllRoleService,
    FindOneRoleService,
    CreateRoleService,
    UpdateRoleService,
    DeleteRoleService,
  ],
})
export class RolesServiceModule {}
