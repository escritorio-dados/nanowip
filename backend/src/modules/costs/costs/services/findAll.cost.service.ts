import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSize } from '@shared/types/pagination';
import { IFindAll } from '@shared/types/types';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig } from '@shared/utils/filter/configSortRepository';
import { selectFields } from '@shared/utils/selectFields';

import { Cost } from '../entities/Cost';
import { FindPaginationCostQuery } from '../query/findPagination.cost.query';
import { FindPaginationDistributionCostQuery } from '../query/findPaginationDistribution.cost.query';
import { CostsRepository } from '../repositories/costs.repository';
import { configStatusCostFilters } from '../utils/configStatusCostFilter';
import { fixHoursCost } from '../utils/fixHoursCost';
import { getStatusCost } from '../utils/getStatusCost';

@Injectable()
export class FindAllCostService {
  constructor(private costsRepository: CostsRepository) {}

  async findAllPagination({ organization_id, query }: IFindAll<FindPaginationCostQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'reason',
        values: [query.reason],
        operation: 'like',
        alias: ['cost.'],
      },
      {
        field: 'description',
        values: [query.description],
        operation: 'like',
        alias: ['cost.'],
      },
      {
        field: 'document_number',
        values: [query.document_number],
        operation: 'like',
        alias: ['cost.'],
      },
      {
        field: 'document_type_id',
        values: [query.document_type_id],
        operation: 'equal',
        alias: ['cost.'],
      },
      {
        field: 'service_provider_id',
        values: [query.service_provider_id],
        operation: 'equal',
        alias: ['cost.'],
      },
      {
        field: 'due_date',
        ...configRangeFilterAlias({
          min_value: fixHoursCost(query.min_due, 0),
          max_value: fixHoursCost(query.max_due, 23),
        }),
        alias: ['cost.'],
      },
      {
        field: 'issue_date',
        ...configRangeFilterAlias({
          min_value: fixHoursCost(query.min_issue, 0),
          max_value: fixHoursCost(query.max_issue, 23),
        }),
        alias: ['cost.'],
      },
      {
        field: 'payment_date',
        ...configRangeFilterAlias({
          min_value: fixHoursCost(query.min_payment, 0),
          max_value: fixHoursCost(query.max_payment, 23),
        }),
        alias: ['cost.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['cost.'],
      },
      {
        field: 'value',
        ...configRangeFilterAlias({ min_value: query.min_value, max_value: query.max_value }),
        alias: ['cost.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['cost.'] },
      reason: { field: 'reason', alias: ['cost.'] },
      description: { field: 'description', alias: ['cost.'] },
      document_number: { field: 'documentNumber', alias: ['cost.'] },
      document_type: { field: 'name', alias: ['documentType.'] },
      service_provider: { field: 'name', alias: ['serviceProvider.'] },
      issue_date: { field: 'issueDate', alias: ['cost.'] },
      due_date: { field: 'dueDate', alias: ['cost.'] },
      payment_date: { field: 'paymentDate', alias: ['cost.'] },
      updated_at: { field: 'updated_at', alias: ['cost.'] },
      created_at: { field: 'created_at', alias: ['cost.'] },
      value: { field: 'value', alias: ['cost.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [costs, total_results] = await this.costsRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
      customFilters: [
        configStatusCostFilters({
          statusDate: query.status,
          entitiesAlias: ['cost.'],
        }),
      ],
    });

    const costsWithStatus = costs.map(cost => ({
      ...selectFields(cost, ['id', 'reason', 'value', 'paymentDate', 'serviceProvider']),
      status: getStatusCost(cost),
    }));

    const apiData: IResponsePagination<Cost[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: costsWithStatus,
    };

    return apiData;
  }

  async findAllPaginationDistribution({
    organization_id,
    query,
  }: IFindAll<FindPaginationDistributionCostQuery>) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'reason',
        values: [query.reason],
        operation: 'like',
        alias: ['cost.'],
      },
      {
        field: 'description',
        values: [query.description],
        operation: 'like',
        alias: ['cost.'],
      },
      {
        field: 'document_number',
        values: [query.document_number],
        operation: 'like',
        alias: ['cost.'],
      },
      {
        field: 'document_type_id',
        values: [query.document_type_id],
        operation: 'equal',
        alias: ['cost.'],
      },
      {
        field: 'service_provider_id',
        values: [query.service_provider_id],
        operation: 'equal',
        alias: ['cost.'],
      },
      {
        field: 'id',
        values: [query.task_type_id],
        operation: 'equal',
        alias: ['taskType.'],
      },
      {
        field: 'id',
        values: [query.product_id],
        operation: 'equal',
        alias: ['product.'],
      },
      {
        field: 'due_date',
        ...configRangeFilterAlias({
          min_value: fixHoursCost(query.min_due, 0),
          max_value: fixHoursCost(query.max_due, 23),
        }),
        alias: ['cost.'],
      },
      {
        field: 'issue_date',
        ...configRangeFilterAlias({
          min_value: fixHoursCost(query.min_issue, 0),
          max_value: fixHoursCost(query.max_issue, 23),
        }),
        alias: ['cost.'],
      },
      {
        field: 'payment_date',
        ...configRangeFilterAlias({
          min_value: fixHoursCost(query.min_payment, 0),
          max_value: fixHoursCost(query.max_payment, 23),
        }),
        alias: ['cost.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['cost.'],
      },
      {
        field: 'value',
        ...configRangeFilterAlias({ min_value: query.min_value, max_value: query.max_value }),
        alias: ['cost.'],
      },
      {
        field: 'percent_distributed',
        ...configRangeFilterAlias({
          min_value: query.min_percent / 100,
          max_value: query.max_percent / 100,
        }),
        alias: ['cost.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['cost.'] },
      reason: { field: 'reason', alias: ['cost.'] },
      description: { field: 'description', alias: ['cost.'] },
      document_number: { field: 'documentNumber', alias: ['cost.'] },
      document_type: { field: 'name', alias: ['documentType.'] },
      service_provider: { field: 'name', alias: ['serviceProvider.'] },
      product: { field: 'name', alias: ['product.'] },
      task_type: { field: 'name', alias: ['taskType.'] },
      issue_date: { field: 'issueDate', alias: ['cost.'] },
      due_date: { field: 'dueDate', alias: ['cost.'] },
      payment_date: { field: 'paymentDate', alias: ['cost.'] },
      updated_at: { field: 'updated_at', alias: ['cost.'] },
      created_at: { field: 'created_at', alias: ['cost.'] },
      value: { field: 'value', alias: ['cost.'] },
      percent_distributed: { field: 'percentDistributed', alias: ['cost.'] },
    };

    const sort = sortConfig[query.sort_by];

    const [costs, total_results] = await this.costsRepository.findAllPaginationDistribution({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
      customFilters: [
        configStatusCostFilters({
          statusDate: query.status,
          entitiesAlias: ['cost.'],
        }),
      ],
    });

    const costsFormatted = costs.map(cost => ({
      ...selectFields(cost, [
        'id',
        'reason',
        'description',
        'value',
        'paymentDate',
        'issueDate',
        'percentDistributed',
      ]),
    }));

    const apiData: IResponsePagination<Cost[]> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: costsFormatted,
    };

    return apiData;
  }
}
