import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { TaskType } from '../entities/TaskType';
import { FindAllLimitedTaskTypesQuery } from '../query/findAllLimited.taskTypes.query';
import { FindAllPaginationTaskTypesQuery } from '../query/findAllPagination.taskTypes.query';
import { TaskTypesRepository } from '../repositories/taskTypes.repository';

@Injectable()
export class FindAllTaskTypeService {
  constructor(private taskTypesRepository: TaskTypesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedTaskTypesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['taskType.'],
      },
    ];

    return this.taskTypesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({ organization_id, query }: IFindAll<FindAllPaginationTaskTypesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['taskType.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['taskType.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['taskType.'] },
      name: { field: 'name', alias: ['taskType.'] },
      updated_at: { field: 'updated_at', alias: ['taskType.'] },
      created_at: { field: 'created_at', alias: ['taskType.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [portfolios, total_results] = await this.taskTypesRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<TaskType[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: portfolios,
    };

    return apiData;
  }
}
