import { Test } from '@nestjs/testing';

import { AppError } from '@shared/errors/AppError';
import { commonErrors } from '@shared/errors/common.errors';

import { projectTypeErrors } from '@modules/projects/errors/projectType.errors';
import {
  projectTypesFake,
  ProjectTypesFakeRepository,
} from '@modules/projects/repositories/projectTypes.fake.repository';
import { ProjectTypesRepository } from '@modules/projects/repositories/projectTypes.repository';
import { CommonProjectTypeService } from '@modules/projects/services/projectTypes/common.projectType.service';
import { DeleteProjectTypeService } from '@modules/projects/services/projectTypes/delete.projectType.service';

describe('ProjectTypes', () => {
  describe('DeleteProjectTypeService', () => {
    let deleteProjectTypeService: DeleteProjectTypeService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [DeleteProjectTypeService, CommonProjectTypeService, ProjectTypesRepository],
      })
        .overrideProvider(ProjectTypesRepository)
        .useClass(ProjectTypesFakeRepository)
        .compile();

      deleteProjectTypeService = moduleRef.get<DeleteProjectTypeService>(DeleteProjectTypeService);
    });

    it('should be able to delete a projectType', async () => {
      const projectType = await deleteProjectTypeService.execute({
        id: projectTypesFake.PT1_O1.id,
        organization_id: projectTypesFake.PT1_O1.organization_id,
      });

      expect(projectType.id === projectTypesFake.PT1_O1.id).toBeTruthy();
    });

    it('should not be able to delete a projectType with projects', async () => {
      await expect(
        deleteProjectTypeService.execute({
          id: projectTypesFake.PT2_O1_WP.id,
          organization_id: projectTypesFake.PT2_O1_WP.organization_id,
        }),
      ).rejects.toEqual(new AppError(projectTypeErrors.deleteWithProjects));
    });

    it('should not be able to delete a projectType from another organization', async () => {
      await expect(
        deleteProjectTypeService.execute({
          id: projectTypesFake.PT1_O1.id,
          organization_id: projectTypesFake.PT3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });
  });
});
