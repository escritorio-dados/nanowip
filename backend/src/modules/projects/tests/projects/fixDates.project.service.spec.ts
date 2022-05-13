import { Test } from '@nestjs/testing';

import { Product } from '@modules/products/entities/Product';
import { Project } from '@modules/projects/entities/Project';
import {
  projectsFake,
  ProjectsFakeRepository,
  subprojectsFake,
} from '@modules/projects/repositories/projects.fake.repository';
import { ProjectsRepository } from '@modules/projects/repositories/projects.repository';
import { FixDatesProjectService } from '@modules/projects/services/projects/fixDates.project.service';

describe('Projects', () => {
  describe('FixDatesProjectService', () => {
    let fixDatesProjectService: FixDatesProjectService;
    let repository: ProjectsFakeRepository;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [FixDatesProjectService, ProjectsRepository],
      })
        .overrideProvider(ProjectsRepository)
        .useClass(ProjectsFakeRepository)
        .compile();

      fixDatesProjectService = moduleRef.get<FixDatesProjectService>(FixDatesProjectService);
      repository = (moduleRef.get<ProjectsRepository>(
        ProjectsRepository,
      ) as unknown) as ProjectsFakeRepository;
    });

    describe('New Dates', () => {
      it('should change the available date if the new date is less than the current data', async () => {
        // 1 Hora anterior a data atual
        const newDate = new Date(projectsFake.P3_O1_WSP.availableDateCalc.getTime() - 3.6e6);

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          available: { new: newDate },
        });

        expect(repository.projectsFake.P3_O1_WSP.availableDateCalc).toEqual(newDate);
      });

      it('should not change the available date if the new date is greater than the current data', async () => {
        // 1 Hora anterior a data atual
        const newDate = new Date(projectsFake.P3_O1_WSP.availableDateCalc.getTime() + 3.6e6);

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          available: { new: newDate },
        });

        expect(repository.projectsFake.P3_O1_WSP.availableDateCalc).not.toEqual(newDate);
      });

      it('should change the start date if the new date is less than the current data', async () => {
        // 1 Hora anterior a data atual
        const newDate = new Date(projectsFake.P3_O1_WSP.startDateCalc.getTime() - 3.6e6);

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          start: { new: newDate },
        });

        expect(repository.projectsFake.P3_O1_WSP.startDateCalc).toEqual(newDate);
      });

      it('should not change the start date if the new date is greater than the current data', async () => {
        // 1 Hora anterior a data atual
        const newDate = new Date(projectsFake.P3_O1_WSP.startDateCalc.getTime() + 3.6e6);

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          start: { new: newDate },
        });

        expect(repository.projectsFake.P3_O1_WSP.startDateCalc).not.toEqual(newDate);
      });

      it('should recalculate the end date if a new date is passed, and get the highest from the sub entities', async () => {
        const lesserDate = new Date(2021, 8, 9, 10, 0, 0); // 09/09/2021 12:00:00

        const newDate = new Date(2021, 8, 9, 12, 0, 0); // 09/09/2021 12:00:00

        const greaterDate = new Date(2021, 8, 9, 14, 0, 0); // 09/09/2021 14:00:00

        jest.spyOn(fixDatesProjectService, 'validadeSubEntities').mockImplementation(async () => {
          const subprojects: Partial<Project>[] = [{ endDateFixed: lesserDate }];

          const subproducts: Partial<Product>[] = [
            { endDateCalc: greaterDate },
            { endDateFixed: newDate },
          ];

          return [...(subprojects as Project[]), ...(subproducts as Product[])];
        });

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          end: { new: newDate },
        });

        expect(repository.projectsFake.P3_O1_WSP.endDateCalc).toEqual(greaterDate);
      });

      it('should remove the end date if the new end date is null', async () => {
        const newDate = null;

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          end: { new: newDate },
        });

        expect(repository.projectsFake.P3_O1_WSP.endDateCalc).toEqual(null);
      });

      it('should not change the end date if any sub entities does not have an end date', async () => {
        const newDate = new Date(2021, 8, 9, 12, 0, 0); // 09/09/2021 12:00:00

        jest.spyOn(fixDatesProjectService, 'validadeSubEntities').mockImplementation(async () => {
          const subprojects: Partial<Project>[] = [
            { endDateFixed: newDate },
            { endDateCalc: null },
          ];

          const subproducts: Partial<Product>[] = [];

          return [...(subprojects as Project[]), ...(subproducts as Product[])];
        });

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P1_O1.id,
          end: { new: newDate },
        });

        expect(repository.projectsFake.P1_O1.endDateCalc).toEqual(null);
      });
    });

    describe('Old Dates', () => {
      it('Should remove the available date if there are no others available dates in the sub entities', async () => {
        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          available: { old: projectsFake.P3_O1_WSP.availableDateCalc },
        });

        jest.spyOn(fixDatesProjectService, 'validadeSubEntities').mockImplementation(async () => {
          return [];
        });

        expect(repository.projectsFake.P3_O1_WSP.availableDateCalc).toEqual(null);
      });

      it('should get the lowest available date from the others sub entities if the new date is null and de the old was the lowest', async () => {
        const lesserDate = new Date(2021, 8, 9, 10, 0, 0); // 09/09/2021 12:00:00

        const greaterDate = new Date(2021, 8, 9, 14, 0, 0); // 09/09/2021 14:00:00

        jest.spyOn(fixDatesProjectService, 'validadeSubEntities').mockImplementation(async () => {
          const subprojects: Partial<Project>[] = [{ availableDateFixed: lesserDate }];

          const subproducts: Partial<Product>[] = [
            { availableDateCalc: greaterDate },
            { availableDateCalc: null },
          ];

          return [...(subprojects as Project[]), ...(subproducts as Product[])];
        });

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          available: { old: projectsFake.P3_O1_WSP.availableDateCalc },
        });

        expect(repository.projectsFake.P3_O1_WSP.availableDateCalc).toEqual(lesserDate);
      });

      it('should remove the start date if there are no others start dates in the sub entities', async () => {
        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          start: { old: projectsFake.P3_O1_WSP.startDateCalc },
          deleted: true,
        });

        jest.spyOn(fixDatesProjectService, 'validadeSubEntities').mockImplementation(async () => {
          const subprojects: Partial<Project>[] = [{ startDateFixed: undefined }];

          const subproducts: Partial<Product>[] = [{ startDateCalc: undefined }];

          return [...(subprojects as Project[]), ...(subproducts as Product[])];
        });

        expect(repository.projectsFake.P3_O1_WSP.startDateCalc).toEqual(null);
      });

      it('should get the lowest start date from the others sub entities if the new date is null and the old date was the lowest', async () => {
        const lesserDate = new Date(2021, 8, 9, 10, 0, 0); // 09/09/2021 12:00:00

        const greaterDate = new Date(2021, 8, 9, 14, 0, 0); // 09/09/2021 14:00:00

        jest.spyOn(fixDatesProjectService, 'validadeSubEntities').mockImplementation(async () => {
          const subprojects: Partial<Project>[] = [{ startDateFixed: lesserDate }];

          const subproducts: Partial<Product>[] = [{ startDateCalc: greaterDate }];

          return [...(subprojects as Project[]), ...(subproducts as Product[])];
        });

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          start: { old: projectsFake.P3_O1_WSP.startDateCalc },
          deleted: true,
        });

        expect(repository.projectsFake.P3_O1_WSP.startDateCalc).toEqual(lesserDate);
      });
    });

    describe('With Delete true', () => {
      it('should remove the end date if there are no others sub entities', async () => {
        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          deleted: true,
        });

        jest.spyOn(fixDatesProjectService, 'validadeSubEntities').mockImplementation(async () => {
          return [];
        });

        expect(repository.projectsFake.P3_O1_WSP.endDateCalc).toEqual(null);
      });

      it('should get the highest end date from the others sub entities if all of them is finished', async () => {
        const lesserDate = new Date(2021, 8, 9, 10, 0, 0); // 09/09/2021 12:00:00
        const greaterDate = new Date(2021, 8, 9, 14, 0, 0); // 09/09/2021 14:00:00

        jest.spyOn(fixDatesProjectService, 'validadeSubEntities').mockImplementation(async () => {
          const subprojects: Partial<Project>[] = [{ endDateFixed: lesserDate }];

          const subproducts: Partial<Product>[] = [{ endDateCalc: greaterDate }];

          return [...(subprojects as Project[]), ...(subproducts as Product[])];
        });

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          deleted: true,
        });

        expect(repository.projectsFake.P3_O1_WSP.endDateCalc).toEqual(greaterDate);
      });
    });

    describe('Others', () => {
      it('should not change any data if the dates params is not passed', async () => {
        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
        });

        const findById = jest.spyOn(repository, 'findById');

        expect(findById).not.toHaveBeenCalled();
      });

      it('should not save alterations if none of the date was changed', async () => {
        // 1 Hora depois da data atual
        const date = new Date(projectsFake.P3_O1_WSP.availableDateCalc.getTime() + 3.6e6);

        const save = jest.spyOn(repository, 'save');

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P3_O1_WSP.id,
          available: { new: date },
        });

        expect(save).not.toHaveBeenCalled();
      });

      it('should verify dates changes in the parent project if a subproject is passed and some date change', async () => {
        const date = new Date(2021, 8, 1, 12, 0, 0);

        const verifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await fixDatesProjectService.verifyDatesChanges({
          project_id: subprojectsFake.S2_P3.id,
          available: { new: date },
        });

        expect(verifyDatesChanges).toHaveBeenLastCalledWith({
          project_id: subprojectsFake.S2_P3.project_parent_id,
          available: { new: date },
        });
      });

      it('should not verify dates changes in the parent project if none of the dates change', async () => {
        const verifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await fixDatesProjectService.verifyDatesChanges({
          project_id: subprojectsFake.S2_P3.id,
          available: { new: subprojectsFake.S2_P3.availableDateCalc },
        });

        expect(verifyDatesChanges).not.toHaveBeenCalledTimes(2);
      });

      it('should not verify dates changes in the parent project if is a root project', async () => {
        const verifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await fixDatesProjectService.verifyDatesChanges({
          project_id: projectsFake.P1_O1.id,
          available: { new: new Date(2019, 5, 3, 12, 45, 12) },
        });

        expect(verifyDatesChanges).not.toHaveBeenCalledTimes(2);
      });
    });
  });
});
