import { Test } from '@nestjs/testing';

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
import { FixDatesProjectService } from '@modules/projects/services/projects/fixDates.project.service';
import { UpdateProjectService } from '@modules/projects/services/projects/update.project.service';
import { CommonProjectTypeService } from '@modules/projects/services/projectTypes/common.projectType.service';
import { FindOneProjectTypeService } from '@modules/projects/services/projectTypes/findOne.projectType.service';

describe('Projects', () => {
  describe('UpdateProjectService', () => {
    let updateProjectService: UpdateProjectService;
    let fixDatesProjectService: FixDatesProjectService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          UpdateProjectService,
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

      updateProjectService = moduleRef.get<UpdateProjectService>(UpdateProjectService);
      fixDatesProjectService = moduleRef.get<FixDatesProjectService>(FixDatesProjectService);
    });

    it('should be able to update a project', async () => {
      const project = await updateProjectService.execute({
        id: projectsFake.P1_O1.id,
        name: 'Novo Nome',
        customer_id: projectsFake.P1_O1.customer_id,
        project_type_id: projectsFake.P1_O1.project_type_id,
        organization_id: projectsFake.P1_O1.organization_id,
      });

      expect(project.name).toEqual('Novo Nome');
    });

    describe('Tests Name', () => {
      it("should not be able to update a project's name with a duplicate name in the same customer (case insensitive)", async () => {
        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P3_O1_WSP.name.toUpperCase(),
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.duplicateName));
      });

      it("should not be able to update a subproject's name with a duplicate name in the same project (case insensitive)", async () => {
        await expect(
          updateProjectService.execute({
            id: subprojectsFake.S1_P3.id,
            name: subprojectsFake.S2_P3.name.toUpperCase(),
            project_parent_id: subprojectsFake.S1_P3.project_parent_id,
            project_type_id: subprojectsFake.S1_P3.project_type_id,
            organization_id: subprojectsFake.S1_P3.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.duplicateName));
      });

      it('should remove any white spaces on the endings of the name', async () => {
        const project = await updateProjectService.execute({
          id: projectsFake.P1_O1.id,
          name: '       Novo Nome      ',
          customer_id: projectsFake.P1_O1.customer_id,
          project_type_id: projectsFake.P1_O1.project_type_id,
          organization_id: projectsFake.P1_O1.organization_id,
        });

        expect(project.name).toBe('Novo Nome');
      });

      it('should allow duplicate names in different customers', async () => {
        const project = await updateProjectService.execute({
          id: projectsFake.P2_O2.id,
          name: projectsFake.P1_O1.name,
          customer_id: projectsFake.P2_O2.customer_id,
          project_type_id: projectsFake.P2_O2.project_type_id,
          organization_id: projectsFake.P2_O2.organization_id,
        });

        expect(project.name).toEqual(projectsFake.P1_O1.name);
      });

      it('should allow duplicate names in different projects', async () => {
        const project = await updateProjectService.execute({
          id: subprojectsFake.S1_P3.id,
          name: subprojectsFake.S3_P1.name,
          project_parent_id: subprojectsFake.S1_P3.project_parent_id,
          project_type_id: subprojectsFake.S1_P3.project_type_id,
          organization_id: subprojectsFake.S1_P3.organization_id,
        });

        expect(project.name).toEqual(subprojectsFake.S3_P1.name);
      });
    });

    describe('Tests Project Type', () => {
      it('should be able to update the project type', async () => {
        const project = await updateProjectService.execute({
          id: projectsFake.P1_O1.id,
          name: projectsFake.P1_O1.name,
          customer_id: projectsFake.P1_O1.customer_id,
          project_type_id: projectTypesFake.PT2_O1_WP.id,
          organization_id: projectsFake.P1_O1.organization_id,
        });

        expect(project.project_type_id).toEqual(projectTypesFake.PT2_O1_WP.id);
      });

      it('should not be able to update the project type with one that does not exists', async () => {
        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: 'Não Existe',
            organization_id: projectsFake.P1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectTypeErrors.notFound));
      });

      it('should not be able to update the project type with one from another organization', async () => {
        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectTypesFake.PT3_O2.id,
            organization_id: projectsFake.P1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
      });
    });

    describe('Tests Portfolios', () => {
      it('should be able to update the portfolios', async () => {
        const project = await updateProjectService.execute({
          id: projectsFake.P1_O1.id,
          name: projectsFake.P1_O1.name,
          customer_id: projectsFake.P1_O1.customer_id,
          project_type_id: projectsFake.P1_O1.project_type_id,
          organization_id: projectsFake.P1_O1.organization_id,
          portfolios_id: [portfoliosFake.P1_O1.id, portfoliosFake.P2_O1_WP.id],
        });

        const portfolios_ids = project.portfolios.map(({ id }) => id);

        expect(portfolios_ids).toEqual([portfoliosFake.P1_O1.id, portfoliosFake.P2_O1_WP.id]);
      });

      it('should not be able to create projects within a portfolio from another organization', async () => {
        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
            portfolios_id: [portfoliosFake.P1_O1.id, portfoliosFake.P3_O2.id],
          }),
        ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
      });
    });

    describe('Tests Parent', () => {
      it('should not be able to update the customer with one that does not exists', async () => {
        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: 'Não Existe',
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(customerErrors.notFound));
      });

      it('should not be able to update the customer with one from another organization', async () => {
        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: customersFake.C3_O2.id,
            project_type_id: projectTypesFake.PT3_O2.id,
            organization_id: projectsFake.P1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
      });

      it('should not be able to update the project parent with a project that does not exists', async () => {
        await expect(
          updateProjectService.execute({
            id: subprojectsFake.S1_P3.id,
            name: subprojectsFake.S1_P3.name,
            project_type_id: subprojectsFake.S1_P3.project_type_id,
            organization_id: customersFake.C1_O1.organization_id,
            project_parent_id: 'Não Existe',
          }),
        ).rejects.toEqual(new AppError(projectErrors.parentNotFound));
      });

      it('should not be able to update the project parent with a project from another organization', async () => {
        await expect(
          updateProjectService.execute({
            id: subprojectsFake.S1_P3.id,
            name: subprojectsFake.S1_P3.name,
            project_type_id: subprojectsFake.S1_P3.project_type_id,
            organization_id: customersFake.C1_O1.organization_id,
            project_parent_id: projectsFake.P2_O2.id,
          }),
        ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
      });

      it('should not be able to update the project parent with a subproject', async () => {
        await expect(
          updateProjectService.execute({
            id: subprojectsFake.S1_P3.id,
            name: subprojectsFake.S1_P3.name,
            project_type_id: subprojectsFake.S1_P3.project_type_id,
            organization_id: customersFake.C1_O1.organization_id,
            project_parent_id: subprojectsFake.S2_P3.id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.subprojectsOfsubprojects));
      });

      it('should be able to update the project parent with another project root', async () => {
        const project = await updateProjectService.execute({
          id: subprojectsFake.S1_P3.id,
          name: subprojectsFake.S1_P3.name,
          project_type_id: subprojectsFake.S1_P3.project_type_id,
          organization_id: customersFake.C1_O1.organization_id,
          project_parent_id: projectsFake.P1_O1.id,
        });

        expect(project.project_parent_id).toEqual(projectsFake.P1_O1.id);
      });

      it('should be able to uptade the customer with another customer', async () => {
        const project = await updateProjectService.execute({
          id: projectsFake.P1_O1.id,
          name: projectsFake.P1_O1.name,
          customer_id: customersFake.C2_O1_WP.id,
          project_type_id: projectsFake.P1_O1.project_type_id,
          organization_id: projectsFake.P1_O1.organization_id,
        });

        expect(project.customer_id).toEqual(customersFake.C2_O1_WP.id);
      });

      it('should not be able to transform a root project in a subproject', async () => {
        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            project_parent_id: projectsFake.P3_O1_WSP.id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.projectSubprojectConversion));
      });

      it('should be able to transform a subproject in a root project', async () => {
        await expect(
          updateProjectService.execute({
            id: subprojectsFake.S1_P3.id,
            name: subprojectsFake.S1_P3.name,
            customer_id: customersFake.C1_O1.id,
            project_type_id: subprojectsFake.S1_P3.project_type_id,
            organization_id: subprojectsFake.S1_P3.organization_id,
          }),
        ).rejects.toEqual(new AppError(projectErrors.projectSubprojectConversion));
      });
    });

    describe('Tests Dates', () => {
      it("should be able to update a project's deadline", async () => {
        const deadline = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00

        const project = await updateProjectService.execute({
          id: projectsFake.P1_O1.id,
          name: projectsFake.P1_O1.name,
          customer_id: projectsFake.P1_O1.customer_id,
          project_type_id: projectsFake.P1_O1.project_type_id,
          organization_id: projectsFake.P1_O1.organization_id,
          deadline,
        });

        expect(project.deadline).toEqual(deadline);
      });

      it("should be able to update a project's available date", async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00

        const project = await updateProjectService.execute({
          id: projectsFake.P1_O1.id,
          name: projectsFake.P1_O1.name,
          customer_id: projectsFake.P1_O1.customer_id,
          project_type_id: projectsFake.P1_O1.project_type_id,
          organization_id: projectsFake.P1_O1.organization_id,
          availableDateFixed: availableDate,
        });

        expect(project.availableDateFixed).toEqual(availableDate);
      });

      it('should not be able to create a project with an available date in the future', async () => {
        const futureDate = new Date(new Date().getTime() + 3.6e6); // +1h

        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
            availableDateFixed: futureDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.futureAvailable));
      });

      it("should be able to update a project's start date", async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00
        const startDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00

        const project = await updateProjectService.execute({
          id: projectsFake.P1_O1.id,
          name: projectsFake.P1_O1.name,
          customer_id: projectsFake.P1_O1.customer_id,
          project_type_id: projectsFake.P1_O1.project_type_id,
          organization_id: projectsFake.P1_O1.organization_id,
          availableDateFixed: availableDate,
          startDateFixed: startDate,
        });

        expect(project.startDateFixed).toEqual(startDate);
      });

      it('should not be able to create a project with a start date without an available date', async () => {
        const startDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00

        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
            startDateFixed: startDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.startWithoutAvailable));
      });

      it('should not be able to create a project with a start date in the future', async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00
        const futureDate = new Date(new Date().getTime() + 3.6e6); // +1h

        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
            availableDateFixed: availableDate,
            startDateFixed: futureDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.futureStart));
      });

      it('should not be able to create a project with a start date less than the available date', async () => {
        const availableDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00
        const startDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00

        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
            availableDateFixed: availableDate,
            startDateFixed: startDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.availableAfterStart));
      });

      it("should be able to update a project's end date", async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00
        const startDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00
        const endDate = new Date(2021, 8, 8, 14, 0, 0); // 08/09/2021 14:00:00

        const project = await updateProjectService.execute({
          id: projectsFake.P1_O1.id,
          name: projectsFake.P1_O1.name,
          customer_id: projectsFake.P1_O1.customer_id,
          project_type_id: projectsFake.P1_O1.project_type_id,
          organization_id: projectsFake.P1_O1.organization_id,
          availableDateFixed: availableDate,
          startDateFixed: startDate,
          endDateFixed: endDate,
        });

        expect(project.endDateFixed).toEqual(endDate);
      });

      it('should not be able to create a project with an end date without a start date', async () => {
        const endDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00

        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
            endDateFixed: endDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.endWithoutStart));
      });

      it('should not be able to create a project with an end date in the future', async () => {
        const availableDate = new Date(2021, 8, 8, 12, 0, 0); // 08/09/2021 12:00:00
        const startDate = new Date(2021, 8, 8, 13, 0, 0); // 08/09/2021 13:00:00

        const futureDate = new Date(new Date().getTime() + 3.6e6); // +1h

        await expect(
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
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
          updateProjectService.execute({
            id: projectsFake.P1_O1.id,
            name: projectsFake.P1_O1.name,
            customer_id: projectsFake.P1_O1.customer_id,
            project_type_id: projectsFake.P1_O1.project_type_id,
            organization_id: projectsFake.P1_O1.organization_id,
            availableDateFixed: availableDate,
            startDateFixed: startDate,
            endDateFixed: endDate,
          }),
        ).rejects.toEqual(new AppError(dateErrors.startAfterEnd));
      });
    });

    describe('Tests Dates Collateral Effects', () => {
      it('should call the function to update the dates if the dates changed', async () => {
        const availableDate = new Date(new Date().getTime() - 10.8e6);
        const startDate = new Date(availableDate.getTime() + 3.6e6);
        const endDate = new Date(startDate.getTime() + 3.6e6);

        const verifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await updateProjectService.execute({
          id: subprojectsFake.S1_P3.id,
          name: subprojectsFake.S1_P3.name,
          project_parent_id: subprojectsFake.S1_P3.project_parent_id,
          project_type_id: subprojectsFake.S1_P3.project_type_id,
          organization_id: subprojectsFake.S1_P3.organization_id,
          availableDateFixed: availableDate,
          startDateFixed: startDate,
          endDateFixed: endDate,
        });

        expect(verifyDatesChanges).toHaveBeenCalledWith({
          project_id: projectsFake.P3_O1_WSP.id,
          available: { new: availableDate, old: subprojectsFake.S1_P3.availableDateFixed },
          start: { new: startDate, old: subprojectsFake.S1_P3.startDateFixed },
          end: { new: endDate },
        });
      });

      it('should call the function to update the dates if project parent is changed', async () => {
        const verifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await updateProjectService.execute({
          id: subprojectsFake.S1_P3.id,
          name: subprojectsFake.S1_P3.name,
          project_parent_id: projectsFake.P1_O1.id,
          project_type_id: subprojectsFake.S1_P3.project_type_id,
          organization_id: subprojectsFake.S1_P3.organization_id,
          availableDateFixed: subprojectsFake.S1_P3.availableDateFixed,
          startDateFixed: subprojectsFake.S1_P3.startDateFixed,
          endDateFixed: subprojectsFake.S1_P3.endDateFixed,
        });

        expect(verifyDatesChanges).toHaveBeenCalledTimes(2);

        expect(verifyDatesChanges).toHaveBeenNthCalledWith(1, {
          project_id: projectsFake.P1_O1.id,
          available: {
            new: subprojectsFake.S1_P3.availableDateFixed,
            old: subprojectsFake.S1_P3.availableDateFixed,
          },
          start: {
            new: subprojectsFake.S1_P3.startDateFixed,
            old: subprojectsFake.S1_P3.startDateFixed,
          },
          end: { new: subprojectsFake.S1_P3.endDateFixed },
        });

        expect(verifyDatesChanges).toHaveBeenNthCalledWith(2, {
          project_id: projectsFake.P3_O1_WSP.id,
          available: { old: subprojectsFake.S1_P3.availableDateFixed },
          start: { old: subprojectsFake.S1_P3.startDateFixed },
          deleted: true,
        });
      });

      it('should not call the function to update the dates if update a root project', async () => {
        const availableDate = new Date();

        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await updateProjectService.execute({
          id: projectsFake.P1_O1.id,
          name: projectsFake.P1_O1.name,
          customer_id: projectsFake.P1_O1.customer_id,
          project_type_id: projectsFake.P1_O1.project_type_id,
          organization_id: projectsFake.P1_O1.organization_id,
          availableDateFixed: availableDate,
        });

        expect(spyVerifyDatesChanges).not.toHaveBeenCalled();
      });

      it('should not call the function to update the dates if none of the dates changed', async () => {
        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await updateProjectService.execute({
          id: subprojectsFake.S1_P3.id,
          name: subprojectsFake.S1_P3.name,
          project_parent_id: subprojectsFake.S1_P3.project_parent_id,
          project_type_id: subprojectsFake.S1_P3.project_type_id,
          organization_id: subprojectsFake.S1_P3.organization_id,
          availableDateFixed: subprojectsFake.S1_P3.availableDateFixed,
          startDateFixed: subprojectsFake.S1_P3.startDateFixed,
          endDateFixed: subprojectsFake.S1_P3.endDateFixed,
        });

        expect(spyVerifyDatesChanges).not.toHaveBeenCalled();
      });

      it('should call the function to update dates only with the dates necessary', async () => {
        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await updateProjectService.execute({
          id: subprojectsFake.S1_P3.id,
          name: subprojectsFake.S1_P3.name,
          project_parent_id: subprojectsFake.S1_P3.project_parent_id,
          project_type_id: subprojectsFake.S1_P3.project_type_id,
          organization_id: subprojectsFake.S1_P3.organization_id,
          availableDateFixed: subprojectsFake.S1_P3.availableDateFixed,
          startDateFixed: subprojectsFake.S1_P3.startDateFixed,
          endDateFixed: new Date(),
        });

        expect(spyVerifyDatesChanges).not.toHaveBeenCalledWith(
          expect.objectContaining({
            start: {},
            available: {},
          }),
        );
      });
    });
  });
});
