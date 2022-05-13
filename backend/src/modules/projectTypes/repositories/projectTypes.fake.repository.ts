import { Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

import { Project } from '@modules/projects/entities/Project';

import { ProjectType } from '../entities/ProjectType';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };

type IProjectTypesFake = {
  PT1_O1: ProjectType;
  PT2_O1_WP: ProjectType;
  PT3_O2: ProjectType;
};

export const projectTypesFake: IProjectTypesFake = {
  PT1_O1: {
    id: 'f43b7739-7675-449c-9372-27e5a2d65b34',
    name: 'Projeto',
    organization_id: 'organization_1',
    projects: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
  PT2_O1_WP: {
    id: 'e20d2ef3-96ab-47c4-8b0d-3a42dce1eaa6',
    name: 'Processo',
    organization_id: 'organization_1',
    projects: [{ id: 'project_1', name: 'project_1' } as Project],
    created_at: new Date(),
    updated_at: new Date(),
  },
  PT3_O2: {
    id: '738b341b-f3ca-4eda-9ecc-b19a99761531',
    name: 'Operação',
    organization_id: 'organization_2',
    projects: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
};

@Injectable()
export class ProjectTypesFakeRepository {
  private repository = Object.values(projectTypesFake);

  async findAll(organization_id: string): Promise<ProjectType[]> {
    return this.repository
      .filter(projectType => projectType.organization_id === organization_id)
      .sort((projectTypeA, projectTypeB) => projectTypeA.name.localeCompare(projectTypeB.name));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(id: string, relations?: string[]): Promise<ProjectType | undefined> {
    return this.repository.find(projectType => projectType.id === id);
  }

  async findByName({ name, organization_id }: IFindByName): Promise<ProjectType | undefined> {
    return this.repository.find(
      projectType =>
        projectType.organization_id === organization_id &&
        projectType.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async create({ name, organization_id }: ICreate): Promise<ProjectType> {
    const newProjectType: ProjectType = {
      id: uuidV4(),
      name,
      organization_id,
      projects: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.repository.push(newProjectType);

    return newProjectType;
  }

  async delete(projectType: ProjectType): Promise<ProjectType> {
    this.repository = this.repository.filter(({ id }) => id !== projectType.id);

    return projectType;
  }

  async save(projectType: ProjectType): Promise<ProjectType> {
    this.repository = this.repository.map(projectTypeRepository => {
      if (projectTypeRepository.id === projectType.id) {
        projectTypeRepository = { ...projectType };
      }

      return projectTypeRepository;
    });

    return projectType;
  }
}
