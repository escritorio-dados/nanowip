import { Test } from '@nestjs/testing';

import StatusDate from '@shared/enums/statusDate.enum';

import { Project } from '@modules/projects/entities/Project';
import { ProjectsFakeRepository } from '@modules/projects/repositories/projects.fake.repository';
import { ProjectsRepository } from '@modules/projects/repositories/projects.repository';
import { CommonProjectService } from '@modules/projects/services/projects/common.project.service';
import { GetStatusDateProjectService } from '@modules/projects/services/projects/getStatusDate.project.service';

describe('Projects', () => {
  describe('GetStatusDateProjectService', () => {
    let getStatusDateProjectService: GetStatusDateProjectService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [GetStatusDateProjectService, CommonProjectService, ProjectsRepository],
      })
        .overrideProvider(ProjectsRepository)
        .useClass(ProjectsFakeRepository)
        .compile();

      getStatusDateProjectService = moduleRef.get<GetStatusDateProjectService>(
        GetStatusDateProjectService,
      );
    });

    it('should be able to get the status Criado', () => {
      const project = {} as Project;

      const status = getStatusDateProjectService.execute(project);

      expect(status).toEqual({ status: StatusDate.created, late: false });
    });

    it('should be able to get the status Criado (Atrasado)', () => {
      // 1 hora atrás
      const date = new Date(new Date().getTime() - 3.6e6);

      const project = {
        deadline: date,
      } as Project;

      const status = getStatusDateProjectService.execute(project);

      expect(status).toEqual({ status: StatusDate.created, late: true });
    });

    it('should be able to get the status Disponivel', () => {
      // 1 hora atrás
      const date = new Date(new Date().getTime() - 3.6e6);

      const project = {
        availableDateFixed: date,
      } as Project;

      const status = getStatusDateProjectService.execute(project);

      expect(status).toEqual({ status: StatusDate.available, late: false });
    });

    it('should be able to get the status Disponivel (Atrasado)', () => {
      // 1 hora atrás
      const date = new Date(new Date().getTime() - 3.6e6);

      const project = {
        availableDateCalc: date,
        deadline: date,
      } as Project;

      const status = getStatusDateProjectService.execute(project);

      expect(status).toEqual({ status: StatusDate.available, late: true });
    });

    it('should be able to get the status em andamento', () => {
      // 1 hora atrás
      const date = new Date(new Date().getTime() - 3.6e6);

      const project = {
        startDateFixed: date,
      } as Project;

      const status = getStatusDateProjectService.execute(project);

      expect(status).toEqual({ status: StatusDate.started, late: false });
    });

    it('should be able to get the status em andamento (Atrasado)', () => {
      // 1 hora atrás
      const date = new Date(new Date().getTime() - 3.6e6);

      const project = {
        startDateCalc: date,
        deadline: date,
      } as Project;

      const status = getStatusDateProjectService.execute(project);

      expect(status).toEqual({ status: StatusDate.started, late: true });
    });

    it('should be able to get the status finalizado', () => {
      // 1 hora atrás
      const date = new Date(new Date().getTime() - 3.6e6);

      const project = {
        endDateFixed: date,
      } as Project;

      const status = getStatusDateProjectService.execute(project);

      expect(status).toEqual({ status: StatusDate.ended, late: false });
    });

    it('should be able to get the status finalizado (Atrasado)', () => {
      // 1 hora atrás
      const date = new Date(new Date().getTime() - 3.6e6);

      // 2 horas atrás
      const deadline = new Date(new Date().getTime() - 7.2e6);

      const project = {
        endDateCalc: date,
        deadline,
      } as Project;

      const status = getStatusDateProjectService.execute(project);

      expect(status).toEqual({ status: StatusDate.ended, late: true });
    });
  });
});
