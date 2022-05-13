import { Test } from '@nestjs/testing';

import { customersFake } from '@modules/customers/repositories/customers.fake.repository';
import { portfoliosFake } from '@modules/portfolios/repositories/portfolios.fake.repository';
import {
  ProjectsFakeRepository,
  projectsFake,
  subprojectsFake,
} from '@modules/projects/repositories/projects.fake.repository';
import { ProjectsRepository } from '@modules/projects/repositories/projects.repository';
import { projectTypesFake } from '@modules/projects/repositories/projectTypes.fake.repository';
import { FindAllProjectService } from '@modules/projects/services/projects/findAll.project.service';

describe('Projects', () => {
  describe('FindAllProjectService', () => {
    let findAllProjectService: FindAllProjectService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [FindAllProjectService, ProjectsRepository],
      })
        .overrideProvider(ProjectsRepository)
        .useClass(ProjectsFakeRepository)
        .compile();

      findAllProjectService = moduleRef.get<FindAllProjectService>(FindAllProjectService);
    });

    it('should be able to find all projects from a organization', async () => {
      const projects = await findAllProjectService.execute({
        organization_id: projectsFake.P1_O1.organization_id,
      });

      const findedIds = projects.map(({ id }) => id).sort((a, b) => a.localeCompare(b));

      const expectedIds = [
        projectsFake.P1_O1.id,
        projectsFake.P3_O1_WSP.id,
        projectsFake.P4_O1_WP.id,
        projectsFake.P5_01_WC.id,
        subprojectsFake.S1_P3.id,
        subprojectsFake.S2_P3.id,
        subprojectsFake.S3_P1.id,
      ].sort((a, b) => a.localeCompare(b));

      expect(findedIds).toEqual(expectedIds);
    });

    it('should be able to find all root projects from a organization', async () => {
      const projects = await findAllProjectService.execute({
        organization_id: projectsFake.P1_O1.organization_id,
        onlyRoot: true,
      });

      const findedIds = projects.map(({ id }) => id).sort((a, b) => a.localeCompare(b));

      const expectedIds = [
        projectsFake.P1_O1.id,
        projectsFake.P3_O1_WSP.id,
        projectsFake.P4_O1_WP.id,
        projectsFake.P5_01_WC.id,
      ].sort((a, b) => a.localeCompare(b));

      expect(findedIds).toEqual(expectedIds);
    });

    it('should be able to find all projects from a customer', async () => {
      const projects = await findAllProjectService.execute({
        customer_id: customersFake.C1_O1.id,
        organization_id: projectsFake.P1_O1.organization_id,
      });

      const findedIds = projects.map(({ id }) => id).sort((a, b) => a.localeCompare(b));

      const expectedIds = [
        projectsFake.P1_O1.id,
        projectsFake.P3_O1_WSP.id,
        projectsFake.P4_O1_WP.id,
        projectsFake.P5_01_WC.id,
      ].sort((a, b) => a.localeCompare(b));

      expect(findedIds).toEqual(expectedIds);
    });

    it('should be able to find all projects from a portfolio', async () => {
      const projects = await findAllProjectService.execute({
        portfolio_id: portfoliosFake.P1_O1.id,
        organization_id: projectsFake.P1_O1.organization_id,
      });

      const findedIds = projects.map(({ id }) => id).sort((a, b) => a.localeCompare(b));

      const expectedIds = [projectsFake.P1_O1.id, subprojectsFake.S2_P3.id].sort((a, b) =>
        a.localeCompare(b),
      );

      expect(findedIds).toEqual(expectedIds);
    });

    it('should be able to find all projects from a project Type', async () => {
      const projects = await findAllProjectService.execute({
        project_type_id: projectTypesFake.PT2_O1_WP.id,
        organization_id: projectsFake.P1_O1.organization_id,
      });

      const findedIds = projects.map(({ id }) => id).sort((a, b) => a.localeCompare(b));

      const expectedIds = [projectsFake.P1_O1.id, subprojectsFake.S2_P3.id].sort((a, b) =>
        a.localeCompare(b),
      );

      expect(findedIds).toEqual(expectedIds);
    });

    it('should be able to find all root projects from a project type', async () => {
      const projects = await findAllProjectService.execute({
        project_type_id: projectTypesFake.PT2_O1_WP.id,
        organization_id: projectsFake.P1_O1.organization_id,
        onlyRoot: true,
      });

      const findedIds = projects.map(({ id }) => id).sort((a, b) => a.localeCompare(b));

      const expectedIds = [projectsFake.P1_O1.id].sort((a, b) => a.localeCompare(b));

      expect(findedIds).toEqual(expectedIds);
    });

    it('should be able to find all subprojects from a project', async () => {
      const projects = await findAllProjectService.execute({
        project_parent_id: projectsFake.P3_O1_WSP.id,
        organization_id: projectsFake.P1_O1.organization_id,
      });

      const findedIds = projects.map(({ id }) => id).sort((a, b) => a.localeCompare(b));

      const expectedIds = [subprojectsFake.S1_P3.id, subprojectsFake.S2_P3.id].sort((a, b) =>
        a.localeCompare(b),
      );

      expect(findedIds).toEqual(expectedIds);
    });

    it('should not be able to find projects from another organization', async () => {
      const projects = await findAllProjectService.execute({
        organization_id: projectsFake.P1_O1.organization_id,
      });

      expect(projects).not.toEqual(expect.arrayContaining([projectsFake.P2_O2]));
    });
  });
});
