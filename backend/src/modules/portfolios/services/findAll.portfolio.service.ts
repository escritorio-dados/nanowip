import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Portfolio } from '../entities/Portfolio';
import { FindAllLimitedPortfoliosQuery } from '../query/findAllLimited.portfolios.query';
import { FindAllPaginationPortifoliosQuery } from '../query/findAllPaginationPortfolios.query';
import { PortfoliosRepository } from '../repositories/portfolios.repository';

type IFindAllPortfolios = {
  organization_id: string;
  portfolios_id?: string[];
  project_id?: string;
};

type IFindAllPagination = { query: FindAllPaginationPortifoliosQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedPortfoliosQuery; organization_id: string };

@Injectable()
export class FindAllPortfolioService {
  constructor(private portfoliosRepository: PortfoliosRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.portfoliosRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<Portfolio[]>> {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [portfolios, total_results] = await this.portfoliosRepository.findAllPagination({
      organization_id,
      page,
      sort_by,
      order_by,
      filters,
    });

    return {
      pagination: {
        page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: portfolios,
    };
  }

  async execute({ organization_id, portfolios_id, project_id }: IFindAllPortfolios) {
    // Todos os portfiolios dos ids pasados
    if (portfolios_id) {
      const portfolios = await this.portfoliosRepository.findAllByIds({
        ids: portfolios_id,
      });

      // Validando todos os portfolios
      if (portfolios.length > 0) {
        portfolios.forEach(portfolio => {
          validateOrganization({ entity: portfolio, organization_id });
        });
      }

      return portfolios;
    }

    // Todos os portfolios de um projeto
    if (project_id) {
      const portfolios = await this.portfoliosRepository.findAllByProject(project_id);

      if (portfolios.length > 0) {
        validateOrganization({ entity: portfolios[0], organization_id });
      }

      return portfolios;
    }

    // Todos os portfolios de uma organização
    return this.portfoliosRepository.findAll({ organization_id });
  }
}
