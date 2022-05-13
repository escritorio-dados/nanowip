import { Injectable } from '@nestjs/common';

import {
  recalculateAvailableDate,
  recalculateEndDate,
  recalculateStartDate,
} from '@shared/utils/changeDatesAux';
import { sliceList } from '@shared/utils/sliceList';

import { Project } from '../entities/Project';
import { ProjectsRepository } from '../repositories/projects.repository';

@Injectable()
export class RecalculateDatesProjectService {
  constructor(private projectsRepository: ProjectsRepository) {}

  private async recalculate(projects: Project[], origin: 'root' | 'sub') {
    const slicedProjects = sliceList({ array: projects, maxLenght: 2000 });

    for await (const sliceProjects of slicedProjects) {
      const projectsRecalculated = sliceProjects.map(project => {
        const children =
          origin === 'sub' ? [...project.products] : [...project.products, ...project.subprojects];

        const availableCalculated = recalculateAvailableDate(children);

        const startCalculated = recalculateStartDate(children);

        const endCalculated = recalculateEndDate(children);

        return {
          ...project,
          availableDate: availableCalculated,
          startDate: startCalculated,
          endDate: endCalculated,
        };
      });

      await this.projectsRepository.saveAll(projectsRecalculated);
    }
  }

  async recalculateDates(organization_id: string) {
    // Pegar todos os sub projetos junto com os seus produtos
    const subprojects = await this.projectsRepository.findAll({
      onlySub: true,
      organization_id,
      relations: ['products'],
    });

    // Recalculando as datas dos subprojetos
    await this.recalculate(subprojects, 'sub');

    // Pegando todos os projetos raiz com os seus subprojetos e produtos
    const rootProjects = await this.projectsRepository.findAll({
      onlyRoot: true,
      organization_id,
      relations: ['subprojects', 'products'],
    });

    // Recalculando as datas dos projetos raiz
    await this.recalculate(rootProjects, 'root');
  }
}
