import { Test } from '@nestjs/testing';
import { validate as isUUID } from 'uuid';

import { AppError } from '@shared/errors/AppError';
import { commonErrors, dateErrors } from '@shared/errors/common.errors';

import { customerErrors } from '@modules/customers/errors/customer.errors';
import {
  customersFake,
  CustomersFakeRepository,
} from '@modules/customers/repositories/customers.fake.repository';
import { CustomersRepository } from '@modules/customers/repositories/customers.repository';
import { CommonCustomerService } from '@modules/customers/services/commonCustomer.service';
import { FindOneCustomerService } from '@modules/customers/services/findOneCustomer.service';
import {
  portfoliosFake,
  PortfoliosFakeRepository,
} from '@modules/portfolios/repositories/portfolios.fake.repository';
import { PortfoliosRepository } from '@modules/portfolios/repositories/portfolios.repository';
import { FindAllPortfolioService } from '@modules/portfolios/services/findAll.portfolio.service';
import { projectErrors } from '@modules/projects/errors/project.errors';
import { projectTypeErrors } from '@modules/projects/errors/projectType.errors';
import {
  projectsFake,
  ProjectsFakeRepository,
  subprojectsFake,
} from '@modules/projects/repositories/projects.fake.repository';
import { ProjectsRepository } from '@modules/projects/repositories/projects.repository';
import {
  projectTypesFake,
  ProjectTypesFakeRepository,
} from '@modules/projects/repositories/projectTypes.fake.repository';
import { ProjectTypesRepository } from '@modules/projects/repositories/projectTypes.repository';
import { CommonProjectService } from '@modules/projects/services/projects/common.project.service';
import { CreateProjectService } from '@modules/projects/services/projects/create.project.service';
import { FixDatesProjectService } from '@modules/projects/services/projects/fixDates.project.service';
import { CommonProjectTypeService } from '@modules/projects/services/projectTypes/common.projectType.service';
import { FindOneProjectTypeService } from '@modules/projects/services/projectTypes/findOne.projectType.service';

describe('Projects', () => {
  describe('CreateProjectService', () => {
    let createProjectService: CreateProjectService;
    let fixDatesProjectService: FixDatesProjectService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          CreateProjectService,
          CommonProjectService,
          ProjectsRepository,
          FixDatesProjectService,

          FindOneProjectTypeService,
          CommonProjectTypeService,
          ProjectTypesRepository,

          FindOneCustomerService,
          CommonCustomerService,
          CustomersRepository,

          FindAllPortfolioService,
          PortfoliosRepository,
        ],
      })
        .overrideProvider(ProjectsRepository)
        .useClass(ProjectsFakeRepository)
        .overrideProvider(ProjectTypesRepository)
        .useClass(ProjectTypesFakeRepository)
        .overrideProvider(CustomersRepository)
        .useClass(CustomersFakeRepository)
        .overrideProvider(PortfoliosRepository)
        .useClass(PortfoliosFakeRepository)
        .compile();

      createProjectService = moduleRef.get<CreateProjectService>(CreateProjectService);
      fixDatesProjectService = moduleRef.get<FixDatesProjectService>(FixDatesProjectService);
    });

    it('should be able to create a project', async () => {
      const project = await createProjectService.execute({
        name: 'Projeto Novo',
        customer_id: customersFake.C1_O1.id,
        project_type_id: projectTypesFake.PT1_O1.id,
        organization_id: customersFake.C1_O1.organization_id,
      });

      expect(isUUID(project.id)).toBeTruthy();
    });

    describe('Tests Name', () => {
      it('should not be able to create a project with same name in the same customer (case insensitive)', async () => {
        await expect(
          createProjectService.execute({
            name: projectsFake.P1_O1.name.toUpperCase(),
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.duplicateName));
      });

      it('should not be able to create a subproject with same name in the same project (case insensitive)', async () => {
        await expect(
          createProjectService.execute({
            name: subprojectsFake.S1_P3.name.toUpperCase(),
            project_parent_id: subprojectsFake.S1_P3.project_parent_id,
            project_type_id: subprojectsFake.S1_P3.project_type_id,
            organization_id: subprojectsFake.S1_P3.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.duplicateName));
      });

      it('should remove any white spaces on the endings of the name', async () => {
        const project = await createProjectService.execute({
          name: '       Novo Nome      ',
          customer_id: customersFake.C1_O1.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: 'organization_1',
        });

        expect(project.name).toBe('Novo Nome');
      });

      it('should allow duplicate names in different customers', async () => {
        const project = await createProjectService.execute({
          name: projectsFake.P1_O1.name,
          customer_id: customersFake.C3_O2.id,
          project_type_id: projectTypesFake.PT3_O2.id,
          organization_id: projectsFake.P2_O2.organization_id,
        });

        expect(isUUID(project.id)).toBeTruthy();
      });

      it('should allow duplicate names in different projects', async () => {
        const project = await createProjectService.execute({
          name: subprojectsFake.S1_P3.name,
          project_parent_id: projectsFake.P1_O1.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: projectsFake.P1_O1.organization_id,
        });

        expect(isUUID(project.id)).toBeTruthy();
      });
    });

    describe('Tests Project Type', () => {
      it('should not be able to create a project with a project type that not exists', async () => {
        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: 'Não Existe',
            organization_id: customersFake.C1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectTypeErrors.notFound));
      });

      it('should not be able to create a project with a project type from another organization', async () => {
        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: projectTypesFake.PT3_O2.id,
            organization_id: customersFake.C1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
      });
    });

    describe('Tests Portfolios', () => {
      it('should be able to create projects within portfolios', async () => {
        const project = await createProjectService.execute({
          name: 'Projeto Novo',
          customer_id: customersFake.C1_O1.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
          portfolios_id: [portfoliosFake.P1_O1.id, portfoliosFake.P2_O1_WP.id],
        });

        const portfolios_ids = project.portfolios.map(({ id }) => id);

        expect(portfolios_ids).toEqual([portfoliosFake.P1_O1.id, portfoliosFake.P2_O1_WP.id]);
      });

      it('should not be able to create projects within a portfolio from another organization', async () => {
        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
            portfolios_id: [portfoliosFake.P1_O1.id, portfoliosFake.P3_O2.id],
          }),
        ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
      });
    });

    describe('Tests Parent', () => {
      it('should not be able to create a project with a customer that not exists', async () => {
        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: 'Não Existe',
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(customerErrors.notFound));
      });

      it('should not be able to create a project with a customer from another organization', async () => {
        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C3_O2.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
      });

      it('should be able to create a subproject', async () => {
        const project = await createProjectService.execute({
          name: 'Projeto Novo',
          project_parent_id: projectsFake.P1_O1.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
        });

        expect(isUUID(project.project_parent_id)).toBeTruthy();
      });

      it('should not be able to create a subproject from a project that does not exists', async () => {
        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            project_parent_id: 'Não Existe',
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.parentNotFound));
      });

      it('should not be able to create a subproject from a project from another organization', async () => {
        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            project_parent_id: projectsFake.P2_O2.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
      });

      it('should not be able to create a project without a customer or a project parent', async () => {
        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.parentNotFound));
      });

      it('should not be able to create a subproject from an subproject', async () => {
        await expect(
          createProjectService.execute({
            name: 'Subprojeto Novo',
            project_parent_id: subprojectsFake.S1_P3.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.subprojectsOfsubprojects));
      });
    });

    describe('Tests Dates', () => {
      it('should be able to create a project with a deadline', async () => {
        const deadline = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00

        const project = await createProjectService.execute({
          name: 'Projeto Novo',
          customer_id: customersFake.C1_O1.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
          deadline,
        });

        expect(project.deadline).toEqual(deadline);
      });

      it('should be able to create a project with an available date', async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00

        const project = await createProjectService.execute({
          name: 'Projeto Novo',
          customer_id: customersFake.C1_O1.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
          availableDateFixed: availableDate,
        });

        expect(project.availableDateFixed).toEqual(availableDate);
      });

      it('should not be able to create a project with an available date in the future', async () => {
        // Data atual mais 10 segundos
        const futureDate = new Date();

        futureDate.setSeconds(futureDate.getSeconds() + 10);

        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
            availableDateFixed: futureDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.futureAvailable));
      });

      it('should be able to create a project with a start date', async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00
        const startDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00

        const project = await createProjectService.execute({
          name: 'Projeto Novo',
          customer_id: customersFake.C1_O1.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
          availableDateFixed: availableDate,
          startDateFixed: startDate,
        });

        expect(project.startDateFixed).toEqual(startDate);
      });

      it('should not be able to create a project with a start date without an available date', async () => {
        const startDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00

        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
            startDateFixed: startDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.startWithoutAvailable));
      });

      it('should not be able to create a project with a start date in the future', async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00

        // Data atual mais 10 segundos
        const futureDate = new Date();

        futureDate.setSeconds(futureDate.getSeconds() + 10);

        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
            availableDateFixed: availableDate,
            startDateFixed: futureDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.futureStart));
      });

      it('should not be able to create a project with a start date less than the available date', async () => {
        const availableDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00
        const startDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00

        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
            availableDateFixed: availableDate,
            startDateFixed: startDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.availableAfterStart));
      });

      it('should be able to create a project with an end date', async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00
        const startDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00
        const endDate = new Date(2021, 8, 8, 14, 0, 0); // 08/09/2021 14:00:00

        const project = await createProjectService.execute({
          name: 'Projeto Novo',
          customer_id: customersFake.C1_O1.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
          availableDateFixed: availableDate,
          startDateFixed: startDate,
          endDateFixed: endDate,
        });

        expect(project.endDateFixed).toEqual(endDate);
      });

      it('should not be able to create a project with an end date without a start date', async () => {
        const endDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00

        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
            endDateFixed: endDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.endWithoutStart));
      });

      it('should not be able to create a project with an end date in the future', async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00
        const startDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00

        // Data atual mais 10 segundos
        const futureDate = new Date();

        futureDate.setSeconds(futureDate.getSeconds() + 10);

        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
            availableDateFixed: availableDate,
            startDateFixed: startDate,
            endDateFixed: futureDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.futureEnd));
      });

      it('should not be able to create a project with an end date less than the start date', async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00
        const startDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00
        const endDate = new Date(2021, 8, 8, 12, 30, 0); // 08/09/2021 12:30:00

        await expect(
          createProjectService.execute({
            name: 'Projeto Novo',
            customer_id: customersFake.C1_O1.id,
            project_type_id: projectTypesFake.PT1_O1.id,
            organization_id: customersFake.C1_O1.organization_id,
            availableDateFixed: availableDate,
            startDateFixed: startDate,
            endDateFixed: endDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.startAfterEnd));
      });
    });

    describe('Tests Dates Collateral Effects', () => {
      it('should call the function to update the dates if create a subproject with dates', async () => {
        const availableDate = new Date(new Date().getTime() - 10.8e6);
        const startDate = new Date(availableDate.getTime() + 3.6e6);
        const endDate = new Date(startDate.getTime() + 3.6e6);

        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await createProjectService.execute({
          name: 'Novo Subprojeto',
          project_parent_id: projectsFake.P3_O1_WSP.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
          availableDateFixed: availableDate,
          startDateFixed: startDate,
          endDateFixed: endDate,
        });

        expect(spyVerifyDatesChanges).toHaveBeenCalledWith({
          project_id: projectsFake.P3_O1_WSP.id,
          available: { new: availableDate },
          start: { new: startDate },
          end: { new: endDate },
        });
      });

      it('should not call the function to update the dates if create a root project', async () => {
        const availableDate = new Date();

        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await createProjectService.execute({
          name: 'Novo Projeto',
          customer_id: customersFake.C1_O1.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
          availableDateFixed: availableDate,
        });

        expect(spyVerifyDatesChanges).not.toHaveBeenCalled();
      });

      it('should not call the function to update the dates if create a subproject without dates', async () => {
        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await createProjectService.execute({
          name: 'Novo Subprojeto',
          project_parent_id: projectsFake.P3_O1_WSP.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
        });

        expect(spyVerifyDatesChanges).not.toHaveBeenCalled();
      });

      it('should call the function to update dates only with the dates necessary', async () => {
        const availableDate = new Date(new Date().getTime() - 7.2e6); // 2 horas atrás

        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await createProjectService.execute({
          name: 'Novo Subprojeto',
          project_parent_id: projectsFake.P3_O1_WSP.id,
          project_type_id: projectTypesFake.PT1_O1.id,
          organization_id: customersFake.C1_O1.organization_id,
          availableDateFixed: availableDate,
        });

        expect(spyVerifyDatesChanges).not.toHaveBeenCalledWith(
          expect.objectContaining({
            start: {},
            end: {},
          }),
        );
      });
    });
  });
});
