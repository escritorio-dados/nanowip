import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { Collaborator } from '../entities/Collaborator';
import { FindAllLimitedCollaboratorsQuery } from '../query/findAllLimited.collaborators.query';
import { FindAllPaginationCollaboratorsQuery } from '../query/findAllPagination.collaborators.query';
import { CollaboratorsRepository } from '../repositories/collaborators.repository';

type IFindAllLimited = IFindAll<FindAllLimitedCollaboratorsQuery> & { onlyTrackers?: boolean };

@Injectable()
export class FindAllCollaboratorService {
  constructor(private collaboratorsRepository: CollaboratorsRepository) {}

  async findAllLimited({ organization_id, query, onlyTrackers }: IFindAllLimited) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['collaborator.'],
      },
    ];

    return this.collaboratorsRepository.findAllLimited({ organization_id, filters, onlyTrackers });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAll<FindAllPaginationCollaboratorsQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['collaborator.'],
      },
      {
        field: 'type',
        values: [query.type],
        operation: 'equal',
        alias: ['collaborator.'],
      },
      {
        field: 'jobTitle',
        values: [query.jobTitle],
        operation: 'like',
        alias: ['collaborator.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['collaborator.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['collaborator.'] },
      name: { field: 'name', alias: ['collaborator.'] },
      updated_at: { field: 'updated_at', alias: ['collaborator.'] },
      created_at: { field: 'created_at', alias: ['collaborator.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [collaborators, total_results] = await this.collaboratorsRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const apiData: IResponsePagination<Collaborator[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: collaborators,
    };

    return apiData;
  }
}
