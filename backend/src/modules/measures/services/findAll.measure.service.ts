import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { Measure } from '../entities/Measure';
import { FindAllLimitedMeasuresQuery } from '../query/findAllLimited.measures.query';
import { FindAllPaginationMeasuresQuery } from '../query/findAllPagination.measures.query';
import { MeasuresRepository } from '../repositories/measures.repository';

type IFindAllMeasureService = { organization_id: string };

type IFindAllPagination = { query: FindAllPaginationMeasuresQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedMeasuresQuery; organization_id: string };

@Injectable()
export class FindAllMeasureService {
  constructor(private measuresRepository: MeasuresRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.measuresRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<Measure[]>> {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [measures, total_results] = await this.measuresRepository.findAllPagination({
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
      data: measures,
    };
  }

  async execute({ organization_id }: IFindAllMeasureService) {
    const measures = await this.measuresRepository.findAll(organization_id);

    return measures;
  }
}
