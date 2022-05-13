import { Test } from '@nestjs/testing';
import { validate as isUUID } from 'uuid';

import { AppError } from '@shared/errors/AppError';

import { projectTypeErrors } from '@modules/projects/errors/projectType.errors';
import {
  projectTypesFake,
  ProjectTypesFakeRepository,
} from '@modules/projects/repositories/projectTypes.fake.repository';
import { ProjectTypesRepository } from '@modules/projects/repositories/projectTypes.repository';
import { CommonProjectTypeService } from '@modules/projects/services/projectTypes/common.projectType.service';
import { CreateProjectTypeService } from '@modules/projects/services/projectTypes/create.projectType.service';

describe('ProjectTypes', () => {
  describe('CreateProjectTypeService', () => {
    let createProjectTypeService: CreateProjectTypeService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [CreateProjectTypeService, CommonProjectTypeService, ProjectTypesRepository],
      })
        .overrideProvider(ProjectTypesRepository)
        .useClass(ProjectTypesFakeRepository)
        .compile();

      createProjectTypeService = moduleRef.get<CreateProjectTypeService>(CreateProjectTypeService);
    });

    it('should be able to create a projectType', async () => {
      const projectType = await createProjectTypeService.execute({
        name: 'Novo Tipo',
        organization_id: 'organization_1',
      });

      expect(isUUID(projectType.id)).toBeTruthy();
    });

    it('should not be able to create a projectType with same name (case insensitive)', async () => {
      await expect(
        createProjectTypeService.execute({
          name: projectTypesFake.PT1_O1.name.toUpperCase(),
          organization_id: projectTypesFake.PT1_O1.organization_id,
        }),
      ).rejects.toEqual(new AppError(projectTypeErrors.duplicateName));
    });

    it('should remove any white spaces on the endings of the name', async () => {
      const projectType = await createProjectTypeService.execute({
        name: '       Tipo Novo      ',
        organization_id: 'organization_1',
      });

      expect(projectType.name).toBe('Tipo Novo');
    });

    it('should allow duplicate names in different organizatons', async () => {
      const projectType = await createProjectTypeService.execute({
        name: projectTypesFake.PT1_O1.name,
        organization_id: projectTypesFake.PT3_O2.organization_id,
      });

      expect(isUUID(projectType.id)).toBeTruthy();
    });
  });
});
