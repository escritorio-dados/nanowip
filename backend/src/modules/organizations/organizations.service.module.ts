import { Module } from '@nestjs/common';

import { OrganizationsRepositoryModule } from './organizations.repository.module';
import { CommonOrganizationService } from './services/common.organization.service';
import { CreateOrganizationService } from './services/create.organization.service';
import { DeleteOrganizationService } from './services/delete.organization.service';
import { FindAllOrganizationService } from './services/findAll.organization.service';
import { FindOneOrganizationService } from './services/findOne.organization.service';
import { UpdateOrganizationService } from './services/update.organization.service';

@Module({
  imports: [OrganizationsRepositoryModule],
  providers: [
    CommonOrganizationService,
    FindAllOrganizationService,
    FindOneOrganizationService,
    CreateOrganizationService,
    UpdateOrganizationService,
    DeleteOrganizationService,
  ],
  exports: [
    FindAllOrganizationService,
    FindOneOrganizationService,
    CreateOrganizationService,
    UpdateOrganizationService,
    DeleteOrganizationService,
  ],
})
export class OrganizationsServiceModule {}
