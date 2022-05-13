import { Test } from '@nestjs/testing';

import { AppError } from '@shared/errors/AppError';
import { commonErrors } from '@shared/errors/common.errors';

import { projectTypeErrors } from '@modules/projects/errors/projectType.errors';
import {
  ProjectTypesFakeRepository,
  projectTypesFake,
} from '@modules/projects/repositories/projectTypes.fake.repository';
import { ProjectTypesRepository } from '@modules/projects/repositories/projectTypes.repository';
import { CommonProjectTypeService } from '@modules/projects/services/projectTypes/common.projectType.service';
import { UpdateProjectTypeService } from '@modules/projects/services/projectTypes/update.projectType.service';

describe('ProjectTypes', () => {
  describe('UpdateProjectTypeService', () => {
    let updateProjectTypeService: UpdateProjectTypeService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [UpdateProjectTypeService, CommonProjectTypeService, ProjectTypesRepository],
      })
        .overrideProvider(ProjectTypesRepository)
        .useClass(ProjectTypesFakeRepository)
        .compile();

      updateProjectTypeService = moduleRef.get<UpdateProjectTypeService>(UpdateProjectTypeService);
    });

    it('should be able to update a projectType', async () => {
      const projectType = await updateProjectTypeService.execute({
        id: projectTypesFake.PT1_O1.id,
        name: 'Novo Nome',
        organization_id: projectTypesFake.PT1_O1.organization_id,
      });

      expect(projectType).toEqual(
        expect.objectContaining({ id: projectTypesFake.PT1_O1.id, name: 'Novo Nome' }),
      );
    });

    it('should not be able to update a projectTypes that not exists', async () => {
      await expect(
        updateProjectTypeService.execute({
          id: 'Não Existe',
          organization_id: projectTypesFake.PT1_O1.organization_id,
          name: projectTypesFake.PT1_O1.name,
        }),
      ).rejects.toEqual(new AppError(projectTypeErrors.notFound));
    });

    it('should not be able to update a projectType from another organization', async () => {
      await expect(
        updateProjectTypeService.execute({
          id: projectTypesFake.PT1_O1.id,
          name: 'Novo Nome',
          organization_id: projectTypesFake.PT3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });

    it('should be able to change de case of the name', async () => {
      const projectType = await updateProjectTypeService.execute({
        id: projectTypesFake.PT1_O1.id,
        name: projectTypesFake.PT1_O1.name.toUpperCase(),
        organization_id: projectTypesFake.PT1_O1.organization_id,
      });

      expect(projectType).toEqual(
        expect.objectContaining({
          id: projectTypesFake.PT1_O1.id,
          name: projectTypesFake.PT1_O1.name.toUpperCase(),
        }),
      );
    });

    it('should not be able to change the name to a name already in use', async () => {
      await expect(
        updateProjectTypeService.execute({
          id: projectTypesFake.PT1_O1.id,
          name: projectTypesFake.PT2_O1_WP.name,
          organization_id: projectTypesFake.PT1_O1.organization_id,
        }),
      ).rejects.toEqual(new AppError(projectTypeErrors.duplicateName));
    });

    it('should allow duplicate names in different organizatons', async () => {
      const projectType = await updateProjectTypeService.execute({
        id: projectTypesFake.PT1_O1.id,
        name: projectTypesFake.PT3_O2.name,
        organization_id: projectTypesFake.PT1_O1.organization_id,
      });

      expect(projectType).toEqual(
        expect.objectContaining({
          id: projectTypesFake.PT1_O1.id,
          name: projectTypesFake.PT3_O2.name,
        }),
      );
    });

    it('should remove any white spaces on the endings of the name', async () => {
      const projectType = await updateProjectTypeService.execute({
        id: projectTypesFake.PT1_O1.id,
        name: '      Novo Nome      ',
        organization_id: projectTypesFake.PT1_O1.organization_id,
      });

      expect(projectType.name).toBe('Novo Nome');
    });
  });
});
