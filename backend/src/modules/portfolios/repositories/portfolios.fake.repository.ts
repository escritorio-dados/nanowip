import { Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

import { Project } from '@modules/projects/entities/Project';

import { Portfolio } from '../entities/Portfolio';

type IFindByName = { name: string; organization_id: string };
type ICreate = { name: string; organization_id: string };
type IFindAllByIds = { ids: string[] };
type IFindAll = { organization_id: string };

type IPortfoliosFake = {
  P1_O1: Portfolio;
  P2_O1_WP: Portfolio;
  P3_O2: Portfolio;
  P3_O1_WP: Portfolio;
};

export const portfoliosFake: IPortfoliosFake = {
  P1_O1: {
    id: '53667b55-a1a5-4369-b3c7-ea0fe9f4bb94',
    name: 'portfolio_1',
    organization_id: 'organization_1',
    projects: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
  P2_O1_WP: {
    id: 'a9f5f080-e6a0-4178-a9c7-e228789c2fc1',
    name: 'portfolio_2',
    organization_id: 'organization_1',
    projects: [{ id: 'project_1', name: 'project_1' } as Project],
    created_at: new Date(),
    updated_at: new Date(),
  },
  P3_O1_WP: {
    id: '22677152-ade8-466a-bdee-b63a03341eb8',
    name: 'portfolio_3',
    organization_id: 'organization_1',
    projects: [{ id: 'project_1', name: 'project_1' } as Project],
    created_at: new Date(),
    updated_at: new Date(),
  },
  P3_O2: {
    id: 'b49386a1-25c0-4857-b874-82af28cf4bd8',
    name: 'portfolio_3',
    organization_id: 'organization_2',
    projects: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
};

@Injectable()
export class PortfoliosFakeRepository {
  private repository = Object.values(portfoliosFake);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(id: string, relations?: string[]): Promise<Portfolio | undefined> {
    return this.repository.find(portfolio => portfolio.id === id);
  }

  async findAll({ organization_id }: IFindAll): Promise<Portfolio[]> {
    return this.repository
      .filter(portfolio => portfolio.organization_id === organization_id)
      .sort((portfolioA, portfolioB) => portfolioA.name.localeCompare(portfolioB.name));
  }

  async findAllByIds({ ids }: IFindAllByIds): Promise<Portfolio[]> {
    const idsObject: { [key: string]: boolean } = {};

    ids.forEach(id => {
      idsObject[id] = true;
    });

    return this.repository
      .filter(portfolio => idsObject[portfolio.id])
      .sort((portfolioA, portfolioB) => portfolioA.name.localeCompare(portfolioB.name));
  }

  async findAllByProject(project_id: string): Promise<Portfolio[]> {
    return this.repository.filter(portfolio =>
      portfolio.projects.some(project => project.id === project_id),
    );
  }

  async findByName({ name, organization_id }: IFindByName): Promise<Portfolio | undefined> {
    return this.repository.find(
      portfolio =>
        portfolio.organization_id === organization_id &&
        portfolio.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async create({ name, organization_id }: ICreate): Promise<Portfolio> {
    const newPortfolio: Portfolio = {
      id: uuidV4(),
      name,
      organization_id,
      projects: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.repository.push(newPortfolio);

    return newPortfolio;
  }

  async delete(portfolio: Portfolio): Promise<Portfolio> {
    this.repository = this.repository.filter(({ id }) => id !== portfolio.id);

    return portfolio;
  }

  async save(portfolio: Portfolio): Promise<Portfolio> {
    this.repository = this.repository.map(portfolioRepository => {
      if (portfolioRepository.id === portfolio.id) {
        portfolioRepository = { ...portfolio };
      }

      return portfolioRepository;
    });

    return portfolio;
  }
}
