import { Module } from '@nestjs/common';

import { ConfigModule } from '@config/config.module';

import { AssignmentsModule } from '@modules/assignments/assignments.module';
import { CollaboratorsStatusModule } from '@modules/colaboratorsStatus/collaborators.module';
import { CollaboratorsModule } from '@modules/collaborators/collaborators.module';
import { CostDistributionsModule } from '@modules/costs/costDistribuitions/costDistributions.module';
import { CostsModule } from '@modules/costs/costs/costs.module';
import { DocumentTypesModule } from '@modules/costs/documentTypes/documenTypes.module';
import { ServiceProvidersModule } from '@modules/costs/serviceProviders/serviceProviders.module';
import { ServicesModule } from '@modules/costs/services/services.module';
import { CustomersModule } from '@modules/customers/customers.module';
import { LinksModule } from '@modules/links/links.module';
import { MeasuresModule } from '@modules/measures/measures.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { PortfoliosModule } from '@modules/portfolios/portfolios.module';
import { ProductsModule } from '@modules/products/products.module';
import { ProductTypesModule } from '@modules/productTypes/productTypes.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { ProjectTypesModule } from '@modules/projectTypes/projectTypes.module';
import { RolesModule } from '@modules/roles/roles.module';
import { TaskReportCommentsModule } from '@modules/tasks/taskReportComments/taskReportComments.module';
import { TasksModule } from '@modules/tasks/tasks/tasks.module';
import { TaskTypesModule } from '@modules/tasks/taskTypes/taskTypes.module';
import { TaskTrailsModule } from '@modules/taskTrails/taskTrails.module';
import { TrackersModule } from '@modules/trackers/trackers.module';
import { TrailsModule } from '@modules/trails/trails.module';
import { UsersModule } from '@modules/users/users.module';
import { ValueChainsModule } from '@modules/valueChains/valueChains.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    OrganizationsModule,
    RolesModule,
    CustomersModule,
    PortfoliosModule,
    ProjectTypesModule,
    ProjectsModule,
    MeasuresModule,
    ProductTypesModule,
    ProductsModule,
    ValueChainsModule,
    TaskTypesModule,
    TasksModule,
    CollaboratorsModule,
    CollaboratorsStatusModule,
    AssignmentsModule,
    TrackersModule,
    TrailsModule,
    TaskTrailsModule,
    DocumentTypesModule,
    ServiceProvidersModule,
    ServicesModule,
    CostsModule,
    CostDistributionsModule,
    LinksModule,
    TaskReportCommentsModule,
  ],
})
export class AppModule {}
