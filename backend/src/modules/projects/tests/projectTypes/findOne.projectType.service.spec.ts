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
import { FindOneProjectTypeService } from '@modules/projects/services/projectTypes/findOne.projectType.service';

describe('ProjectTypes', () => {
  describe('FindOneProjectTypeService', () => {
    let findOneProjectTypeService: FindOneProjectTypeService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [FindOneProjectTypeService, CommonProjectTypeService, ProjectTypesRepository],
      })
        .overrideProvider(ProjectTypesRepository)
        .useClass(ProjectTypesFakeRepository)
        .compile();

      findOneProjectTypeService = moduleRef.get<FindOneProjectTypeService>(
        FindOneProjectTypeService,
      );
    });

    it('should be able to find one projectType', async () => {
      // Deletando o cliente
      const projectType = await findOneProjectTypeService.execute({
        id: projectTypesFake.PT1_O1.id,
        organization_id: projectTypesFake.PT1_O1.organization_id,
      });

      expect(projectType).toEqual(expect.objectContaining(projectTypesFake.PT1_O1));
    });

    it('should not be able to find a projectType that not exists', async () => {
      await expect(
        findOneProjectTypeService.execute({ id: 'Não Existe', organization_id: 'organização_1' }),
      ).rejects.toEqual(new AppError(projectTypeErrors.notFound));
    });

    it('should not be able to return a projectType from another organization', async () => {
      await expect(
        findOneProjectTypeService.execute({
          id: projectTypesFake.PT1_O1.id,
          organization_id: projectTypesFake.PT3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });
  });
});
