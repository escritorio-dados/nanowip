import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { DocumentTypeCost } from '../entities/DocumentType';
import { FindAllLimitedDocumentTypesQuery } from '../query/findAllLimited.documentTypes.query';
import { FindAllPaginationDocumentTypesQuery } from '../query/findAllPagination.documentTypes.query';
import { DocumentTypesRepository } from '../repositories/documentTypes.repository';

type IFindAllPagination = { query: FindAllPaginationDocumentTypesQuery; organization_id: string };
type IFindAllLimited = { query: FindAllLimitedDocumentTypesQuery; organization_id: string };

@Injectable()
export class FindAllDocumentTypeService {
  constructor(private documentTypesRepository: DocumentTypesRepository) {}

  async findAllLimited({ organization_id, query }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.documentTypesRepository.findAllLimited({ organization_id, filters });
  }

  async findAllPagination({ organization_id, query }: IFindAllPagination) {
    const { page, sort_by, order_by, name, min_updated, max_updated } = query;

    const filters: IFilterConfig = {
      name: name && ['like', name],
      updated_at: configRangeFilter({ min_value: min_updated, max_value: max_updated }),
    };

    const [documentTypes, total_results] = await this.documentTypesRepository.findAllPagination({
      organization_id,
      page,
      sort_by,
      order_by,
      filters,
    });

    const apiData: IResponsePagination<DocumentTypeCost[]> = {
      pagination: {
        page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: documentTypes,
    };

    return apiData;
  }
}
