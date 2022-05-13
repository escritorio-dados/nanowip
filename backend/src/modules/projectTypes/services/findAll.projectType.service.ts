import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { ProjectType } from '../entities/ProjectType';
import { FindAllLimitedProjectTypesQuery } from '../query/findAllLimited.projectTypes.query';
import { FindAllPaginationProjectTypesQuery } from '../query/findAllPaginationProjectTypes.query';
import { ProjectTypesRepository } from '../repositories/projectTypes.repository';

type IFindAllProjectTypeService = { organization_id: string };

type IFindAllPagination = { query: FindAllPaginationProjectTypesQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedProjectTypesQuery; organization_id: string };

@Injectable()
export class FindAllProjectTypeService {
  constructor(private projectTypesRepository: ProjectTypesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.projectTypesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<ProjectType[]>> {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [portfolios, total_results] = await this.projectTypesRepository.findAllPagination({
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

  async execute({ organization_id }: IFindAllProjectTypeService) {
    const projectTypes = await this.projectTypesRepository.findAll(organization_id);

    return projectTypes;
  }
}
