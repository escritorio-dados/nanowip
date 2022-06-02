import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { DocumentTypeCost } from '../entities/DocumentType';
import { FindAllLimitedDocumentTypesQuery } from '../query/findAllLimited.documentTypes.query';
import { FindAllPaginationDocumentTypesQuery } from '../query/findAllPagination.documentTypes.query';
import { DocumentTypesRepository } from '../repositories/documentTypes.repository';

@Injectable()
export class FindAllDocumentTypeService {
  constructor(private documentTypesRepository: DocumentTypesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAll<FindAllLimitedDocumentTypesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['documentType.'],
      },
    ];

    return this.documentTypesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAll<FindAllPaginationDocumentTypesQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['documentType.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['documentType.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['documentType.'] },
      name: { field: 'name', alias: ['documentType.'] },
      updated_at: { field: 'updated_at', alias: ['documentType.'] },
      created_at: { field: 'created_at', alias: ['documentType.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [documentTypes, total_results] = await this.documentTypesRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<DocumentTypeCost[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: documentTypes,
    };

    return apiData;
  }
}
