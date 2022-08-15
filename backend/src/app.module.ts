import { Module } from '@nestjs/common';

import { ConfigModule } from '@config/config.module';

import { AssignmentsModule } from '@modules/assignments/assignments.module';
import { CollaboratorsStatusModule } from '@modules/collaborators/colaboratorsStatus/collaboratorsStatus.module';
import { CollaboratorsModule } from '@modules/collaborators/collaborators/collaborators.module';
import { CostDistributionsModule } from '@modules/costs/costDistribuitions/costDistributions.module';
import { CostsModule } from '@modules/costs/costs/costs.module';
import { DocumentTypesModule } from '@modules/costs/documentTypes/documenTypes.module';
import { ServiceProvidersModule } from '@modules/costs/serviceProviders/serviceProviders.module';
import { CustomersModule } from '@modules/customers/customers.module';
import { LinksModule } from '@modules/links/links.module';
import { MilestonesModule } from '@modules/milestones/milestones/milestones.module';
import { MilestonesGroupsModule } from '@modules/milestones/milestonesGroups/milestonesGroups.module';
import { DeliverablesModule } from '@modules/objectives/deliverables/deliverables.module';
import { DeliverableTagsModule } from '@modules/objectives/deliverableTags/deliverableTags.module';
import { IntegratedObjectivesModule } from '@modules/objectives/integratedObjectives/integratedObjectives.module';
import { ObjectiveCategoriesModule } from '@modules/objectives/objectiveCategories/objectiveCategories.module';
import { ObjectiveSectionsModule } from '@modules/objectives/objectiveSections/objectiveSections.module';
import { OperationalObjectivesModule } from '@modules/objectives/operacionalObjectives/operationalObjectives.module';
import { SectionTrailsModule } from '@modules/objectives/trailsSections/sectionTrails/sectionTrails.module';
import { TrailSectionsModule } from '@modules/objectives/trailsSections/trailSections/trailSections.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { PortfoliosModule } from '@modules/portfolios/portfolios.module';
import { MeasuresModule } from '@modules/products/measures/measures.module';
import { ProductsModule } from '@modules/products/products/products.module';
import { ProductTypesModule } from '@modules/products/productTypes/productTypes.module';
import { ProjectsModule } from '@modules/projects/projects/projects.module';
import { ProjectTypesModule } from '@modules/projects/projectTypes/projectTypes.module';
import { TagsModule } from '@modules/tags/tags/tags.module';
import { TagsGroupsModule } from '@modules/tags/tagsGroups/tagsGroups.module';
import { TaskReportCommentsModule } from '@modules/tasks/taskReportComments/taskReportComments.module';
import { TasksModule } from '@modules/tasks/tasks/tasks.module';
import { TaskTypesModule } from '@modules/tasks/taskTypes/taskTypes.module';
import { TrackersModule } from '@modules/trackers/trackers.module';
import { TaskTrailsModule } from '@modules/trails/taskTrails/taskTrails.module';
import { TrailsModule } from '@modules/trails/trails/trails.module';
import { RolesModule } from '@modules/users/roles/roles.module';
import { UsersModule } from '@modules/users/users/users.module';
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
    CostsModule,
    CostDistributionsModule,
    LinksModule,
    TaskReportCommentsModule,
    OperationalObjectivesModule,
    IntegratedObjectivesModule,
    ObjectiveCategoriesModule,
    SectionTrailsModule,
    TrailSectionsModule,
    ObjectiveSectionsModule,
    DeliverablesModule,
    TagsGroupsModule,
    TagsModule,
    DeliverableTagsModule,
    MilestonesGroupsModule,
    MilestonesModule,
  ],
})
export class AppModule {}
