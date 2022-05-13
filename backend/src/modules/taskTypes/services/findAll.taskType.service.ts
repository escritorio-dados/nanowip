import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { TaskType } from '../entities/TaskType';
import { FindAllLimitedTaskTypesQuery } from '../query/findAllLimited.taskTypes.query';
import { FindAllPaginationTaskTypesQuery } from '../query/findAllPagination.taskTypes.query';
import { TaskTypesRepository } from '../repositories/taskTypes.repository';

type IFindAllTaskTypeService = { organization_id: string };

type IFindAllPagination = { query: FindAllPaginationTaskTypesQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedTaskTypesQuery; organization_id: string };

@Injectable()
export class FindAllTaskTypeService {
  constructor(private taskTypesRepository: TaskTypesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.taskTypesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<TaskType[]>> {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [portfolios, total_results] = await this.taskTypesRepository.findAllPagination({
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

  async execute({ organization_id }: IFindAllTaskTypeService) {
    const taskTypes = await this.taskTypesRepository.findAll({ organization_id });

    return taskTypes;
  }
}
