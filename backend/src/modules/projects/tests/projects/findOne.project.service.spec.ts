import { Test } from '@nestjs/testing';

import { AppError } from '@shared/errors/AppError';
import { commonErrors } from '@shared/errors/common.errors';

import { projectErrors } from '@modules/projects/errors/project.errors';
import {
  ProjectsFakeRepository,
  projectsFake,
} from '@modules/projects/repositories/projects.fake.repository';
import { ProjectsRepository } from '@modules/projects/repositories/projects.repository';
import { CommonProjectService } from '@modules/projects/services/projects/common.project.service';
import { FindOneProjectService } from '@modules/projects/services/projects/findOne.project.service';

describe('Projects', () => {
  describe('FindOneProjectService', () => {
    let findOneProjectService: FindOneProjectService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [FindOneProjectService, CommonProjectService, ProjectsRepository],
      })
        .overrideProvider(ProjectsRepository)
        .useClass(ProjectsFakeRepository)
        .compile();

      findOneProjectService = moduleRef.get<FindOneProjectService>(FindOneProjectService);
    });

    it('should be able to find one project', async () => {
      const project = await findOneProjectService.execute({
        id: projectsFake.P1_O1.id,
        organization_id: projectsFake.P1_O1.organization_id,
      });

      expect(project).toEqual(expect.objectContaining(projectsFake.P1_O1));
    });

    it('should not be able to find a project that not exists', async () => {
      await expect(
        findOneProjectService.execute({ id: 'Não Existe', organization_id: 'organização_1' }),
      ).rejects.toEqual(new AppError(projectErrors.notFound));
    });

    it('should not be able to return a project from another organization', async () => {
      await expect(
        findOneProjectService.execute({
          id: projectsFake.P2_O2.id,
          organization_id: projectsFake.P1_O1.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });
  });
});
