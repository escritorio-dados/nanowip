import { forwardRef, Module } from '@nestjs/common';

import { CustomersServiceModule } from '@modules/customers/customers.service.module';
import { PortfoliosServiceModule } from '@modules/portfolios/portfolios.service.module';
import { ProductsServiceModule } from '@modules/products/products/products.service.module';
import { ProjectTypesServiceModule } from '@modules/projects/projectTypes/projectTypes.service.module';

import { ProjectsRepositoryModule } from './projects.repository.module';
import { CommonProjectService } from './services/common.project.service';
import { CreateProjectService } from './services/create.project.service';
import { DeleteProjectService } from './services/delete.project.service';
import { FindAllProjectService } from './services/findAll.project.service';
import { FindOneProjectService } from './services/findOne.project.service';
import { FixDatesProjectService } from './services/fixDates.project.service';
import { RecalculateDatesProjectService } from './services/recalculateDates.project.service';
import { UpdateProjectService } from './services/update.project.service';

@Module({
  imports: [
    ProjectsRepositoryModule,
    CustomersServiceModule,
    ProjectTypesServiceModule,
    PortfoliosServiceModule,
    forwardRef(() => ProductsServiceModule),
  ],
  providers: [
    CommonProjectService,
    FindAllProjectService,
    FindOneProjectService,
    UpdateProjectService,
    DeleteProjectService,
    CreateProjectService,
    FixDatesProjectService,
    RecalculateDatesProjectService,
  ],
  exports: [
    FindAllProjectService,
    FindOneProjectService,
    UpdateProjectService,
    DeleteProjectService,
    CreateProjectService,
    FixDatesProjectService,
    RecalculateDatesProjectService,
  ],
})
export class ProjectsServiceModule {}
