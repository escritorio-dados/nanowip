import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSize } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';

import { CollaboratorStatus } from '../entities/CollaboratorStatus';
import { FindAllPaginationCollaboratorsStatusQuery } from '../query/findAllPagination.collaboratorsStatus.query';
import { CollaboratorsStatusRepository } from '../repositories/collaboratorStatus.repository';
import { CommonCollaboratorStatusService } from './common.collaboratorStatus.service';

@Injectable()
export class FindAllCollaboratorStatusService {
  constructor(
    private collaboratorsStatusRepository: CollaboratorsStatusRepository,
    private commonCollaboratorStatusService: CommonCollaboratorStatusService,
  ) {}

  async findAllPagination({
    organization_id,
    query,
  }: IFindAll<FindAllPaginationCollaboratorsStatusQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'collaborator_id',
        values: [query.collaborator_id],
        operation: 'equal',
        alias: ['collaboratorStatus.'],
      },
      {
        field: 'salary',
        ...configRangeFilterAlias({ min_value: query.min_salary, max_value: query.max_salary }),
        alias: ['collaboratorStatus.'],
      },
      {
        field: 'monthHours',
        ...configRangeFilterAlias({
          min_value: query.min_month_hours,
          max_value: query.max_month_hours,
        }),
        alias: ['collaboratorStatus.'],
      },
      {
        field: 'date',
        ...configRangeFilterAlias({
          min_value: this.commonCollaboratorStatusService.fixDate(query.min_date, 1),
          max_value: this.commonCollaboratorStatusService.fixDate(query.max_date, -1),
        }),
        alias: ['collaboratorStatus.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['collaboratorStatus.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['collaboratorStatus.'] },
      salary: { field: 'salary', alias: ['collaboratorStatus.'] },
      month_hours: { field: 'monthHours', alias: ['collaboratorStatus.'] },
      collaborator: { field: 'name', alias: ['collaborator.'] },
      date: { field: 'date', alias: ['collaboratorStatus.'] },
      updated_at: { field: 'updated_at', alias: ['collaboratorStatus.'] },
      created_at: { field: 'created_at', alias: ['collaboratorStatus.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [
      collaboratorsStatus,
      total_results,
    ] = await this.collaboratorsStatusRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
    });

    const dataFormmated = collaboratorsStatus.map(collaboratorStatus => ({
      ...collaboratorStatus,
      created_at: undefined,
      updated_at: undefined,
    }));

    const apidData: IResponsePagination<CollaboratorStatus[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: dataFormmated,
    };

    return apidData;
  }
}
