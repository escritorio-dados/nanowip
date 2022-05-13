import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSizeLarge } from '@shared/types/pagination';
import { IFilterConfig } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilter } from '@shared/utils/filter/configRangeFilter';

import { Collaborator } from '../entities/Collaborator';
import { FindAllLimitedCollaboratorsQuery } from '../query/findAllLimited.collaborators.query';
import { FindAllPaginationCollaboratorsQuery } from '../query/findAllPagination.collaborators.query';
import { CollaboratorsRepository } from '../repositories/collaborators.repository';

type IFindAllCollaboratorService = { organization_id: string };

type IFindAllPagination = { query: FindAllPaginationCollaboratorsQuery; organization_id: string };
type IFindAllLimited = {
  query: FindAllLimitedCollaboratorsQuery;
  organization_id: string;
  onlyTrackers?: boolean;
};

@Injectable()
export class FindAllCollaboratorService {
  constructor(private collaboratorsRepository: CollaboratorsRepository) {}

  async findAllLimited({ organization_id, query, onlyTrackers }: IFindAllLimited) {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
    };

    return this.collaboratorsRepository.findAllLimited({ organization_id, filters, onlyTrackers });
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<Collaborator[]>> {
    const filters: IFilterConfig = {
      name: query.name && ['like', query.name],
      type: query.type && ['equal', query.type],
      jobTitle: query.jobTitle && ['like', query.jobTitle],
      updated_at: configRangeFilter({ min_value: query.min_updated, max_value: query.max_updated }),
    };

    const [collaborators, total_results] = await this.collaboratorsRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: query.sort_by,
      order_by: query.order_by,
      filters,
    });

    return {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeLarge),
      },
      data: collaborators,
    };
  }

  async execute({ organization_id }: IFindAllCollaboratorService) {
    return this.collaboratorsRepository.findAll({ organization_id });
  }
}
