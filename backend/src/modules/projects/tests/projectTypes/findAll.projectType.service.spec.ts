import { Test } from '@nestjs/testing';

import {
  ProjectTypesFakeRepository,
  projectTypesFake,
} from '@modules/projects/repositories/projectTypes.fake.repository';
import { ProjectTypesRepository } from '@modules/projects/repositories/projectTypes.repository';
import { FindAllProjectTypeService } from '@modules/projects/services/projectTypes/findAll.projectType.service';

describe('ProjectTypes', () => {
  describe('FindAllProjectTypeService', () => {
    let findAllProjectTypeService: FindAllProjectTypeService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [FindAllProjectTypeService, ProjectTypesRepository],
      })
        .overrideProvider(ProjectTypesRepository)
        .useClass(ProjectTypesFakeRepository)
        .compile();

      findAllProjectTypeService = moduleRef.get<FindAllProjectTypeService>(
        FindAllProjectTypeService,
      );
    });

    it('should be able to find all projectType from a organization', async () => {
      const projectTypes = await findAllProjectTypeService.execute({
        organization_id: projectTypesFake.PT1_O1.organization_id,
      });

      expect(projectTypes).toEqual(
        expect.arrayContaining([projectTypesFake.PT1_O1, projectTypesFake.PT2_O1_WP]),
      );
    });

    it('should not be able to find projectTypes from another organization', async () => {
      const projectTypes = await findAllProjectTypeService.execute({
        organization_id: projectTypesFake.PT1_O1.organization_id,
      });

      expect(projectTypes).not.toEqual(expect.arrayContaining([projectTypesFake.PT3_O2]));
    });
  });
});
