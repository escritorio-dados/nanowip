import { Test } from '@nestjs/testing';

import { AppError } from '@shared/errors/AppError';
import { commonErrors } from '@shared/errors/common.errors';

import { projectErrors } from '@modules/projects/errors/project.errors';
import {
  projectsFake,
  ProjectsFakeRepository,
  subprojectsFake,
} from '@modules/projects/repositories/projects.fake.repository';
import { ProjectsRepository } from '@modules/projects/repositories/projects.repository';
import { CommonProjectService } from '@modules/projects/services/projects/common.project.service';
import { DeleteProjectService } from '@modules/projects/services/projects/delete.project.service';
import { FixDatesProjectService } from '@modules/projects/services/projects/fixDates.project.service';

describe('Projects', () => {
  describe('DeleteProjectService', () => {
    let deleteProjectService: DeleteProjectService;
    let fixDatesProjectService: FixDatesProjectService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          DeleteProjectService,
          CommonProjectService,
          ProjectsRepository,
          FixDatesProjectService,
        ],
      })
        .overrideProvider(ProjectsRepository)
        .useClass(ProjectsFakeRepository)
        .compile();

      deleteProjectService = moduleRef.get<DeleteProjectService>(DeleteProjectService);
      fixDatesProjectService = moduleRef.get<FixDatesProjectService>(FixDatesProjectService);
    });

    it('should be able to delete a project', async () => {
      const project = await deleteProjectService.execute({
        id: projectsFake.P1_O1.id,
        organization_id: projectsFake.P1_O1.organization_id,
      });

      expect(project.id === projectsFake.P1_O1.id).toBeTruthy();
    });

    it('should not be able to delete a project with subprojects', async () => {
      await expect(
        deleteProjectService.execute({
          id: projectsFake.P3_O1_WSP.id,
          organization_id: projectsFake.P3_O1_WSP.organization_id,
        }),
      ).rejects.toEqual(new AppError(projectErrors.deleteWithSubprojects));
    });

    it('should not be able to delete a project with costs', async () => {
      await expect(
        deleteProjectService.execute({
          id: projectsFake.P5_01_WC.id,
          organization_id: projectsFake.P5_01_WC.organization_id,
        }),
      ).rejects.toEqual(new AppError(projectErrors.deleteWithCosts));
    });

    it('should not be able to delete a project with products', async () => {
      await expect(
        deleteProjectService.execute({
          id: projectsFake.P4_O1_WP.id,
          organization_id: projectsFake.P4_O1_WP.organization_id,
        }),
      ).rejects.toEqual(new AppError(projectErrors.deleteWithProducts));
    });

    it('should not be able to delete a project from another organization', async () => {
      await expect(
        deleteProjectService.execute({
          id: projectsFake.P1_O1.id,
          organization_id: projectsFake.P2_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });

    describe('Tests Dates Collateral Effects', () => {
      it('should call the function to update the dates if delete a subproject', async () => {
        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await deleteProjectService.execute({
          id: subprojectsFake.S1_P3.id,
          organization_id: subprojectsFake.S1_P3.organization_id,
        });

        expect(spyVerifyDatesChanges).toHaveBeenCalledWith({
          project_id: projectsFake.P3_O1_WSP.id,
          available: { old: subprojectsFake.S1_P3.availableDateFixed },
          start: { old: subprojectsFake.S1_P3.startDateFixed },
          deleted: true,
        });
      });

      it('should not call the function to update the dates if delete a project', async () => {
        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await deleteProjectService.execute({
          id: projectsFake.P1_O1.id,
          organization_id: projectsFake.P1_O1.organization_id,
        });

        expect(spyVerifyDatesChanges).not.toHaveBeenCalled();
      });

      it('should call the function to update dates only with the dates necessary', async () => {
        const spyVerifyDatesChanges = jest.spyOn(fixDatesProjectService, 'verifyDatesChanges');

        await deleteProjectService.execute({
          id: subprojectsFake.S2_P3.id,
          organization_id: subprojectsFake.S2_P3.organization_id,
        });

        expect(spyVerifyDatesChanges).not.toHaveBeenCalledWith(
          expect.objectContaining({
            available: {},
            start: {},
          }),
        );
      });
    });
  });
});
