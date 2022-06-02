import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { ProjectsServiceModule } from '@modules/projects/projects/projects.service.module';

import { OrganizationsController } from './controllers/organizations.controller';
import { PublicOrganizationsController } from './controllers/public.organizations.controller';
import { OrganizationsServiceModule } from './organizations.service.module';

@Module({
  controllers: [PublicOrganizationsController, OrganizationsController],
  imports: [OrganizationsServiceModule, ProjectsServiceModule, CaslModule],
})
export class OrganizationsModule {}
