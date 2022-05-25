import { Injectable } from '@nestjs/common';
import { Brackets } from 'typeorm';

import StatusDate from '@shared/enums/statusDate.enum';
import { IResponsePagination, paginationSize, paginationSizeSmall } from '@shared/types/pagination';
import { ICustomFilters, IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import {
  ISortConfig,
  ISortValue,
  sortSubFunction,
} from '@shared/utils/filter/configSortRepository';
import { configStatusDatesFilters } from '@shared/utils/filter/configStatusDateFilter';
import { getDynamicField } from '@shared/utils/getDynamicField';
import { getParentPath, getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';

import { Product } from '@modules/products/entities/Product';
import { ProductsRepository } from '@modules/products/repositories/products.repository';

import { FindAllLimitedProductsQuery } from '../query/findAllLimited.product.query';
import { FindPaginationProductQuery } from '../query/findPagination.product.query';
import { ReportProductQuery } from '../query/report.product.query';

type IFindAllPagination = { query: FindPaginationProductQuery; organization_id: string };
type IFindReport = { query: ReportProductQuery; organization_id: string };
type IFindAllLimited = {
  query: FindAllLimitedProductsQuery;
  organization_id: string;
  onlyRoot?: boolean;
};

@Injectable()
export class FindAllProductService {
  constructor(private productsRepository: ProductsRepository) {}

  async findAllLimitedRoot({ organization_id, query, onlyRoot }: IFindAllLimited) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['product.', 'project.', 'productParent.'],
      },
    ];

    const products = await this.productsRepository.findAllLimited({
      organization_id,
      filters,
      onlyRoot,
    });

    return products.map(product => ({
      ...product,
      pathString: getParentPathString({
        entity: product,
        getCustomer: true,
        entityType: 'product',
      }),
      path: getParentPath({
        entity: product,
        getCustomer: true,
        entityType: 'product',
        includeEntity: true,
      }),
      project: undefined,
      productParent: undefined,
    }));
  }

  async findAllPagination({
    organization_id,
    query,
  }: IFindAllPagination): Promise<IResponsePagination<Product[]>> {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['product.', 'subproducts.'],
      },
      { field: 'project_id', values: [query.project_id], operation: 'equal', alias: ['product.'] },
      {
        field: 'product_type_id',
        values: [query.product_type_id],
        operation: 'equal',
        alias: ['product.', 'subproducts.'],
      },
      {
        field: 'measure_id',
        values: [query.measure_id],
        operation: 'equal',
        alias: ['product.', 'subproducts.'],
      },
      {
        field: 'quantity',
        ...configRangeFilterAlias({ min_value: query.min_quantity, max_value: query.max_quantity }),
        alias: ['product.', 'subproducts.'],
      },
      {
        field: 'available_date',
        ...configRangeFilterAlias({
          min_value: query.min_available,
          max_value: query.max_available,
        }),
        alias: ['product.', 'subproducts.'],
      },
      {
        field: 'deadline',
        ...configRangeFilterAlias({ min_value: query.min_deadline, max_value: query.max_deadline }),
        alias: ['product.', 'subproducts.'],
      },
      {
        field: 'start_date',
        ...configRangeFilterAlias({ min_value: query.min_start, max_value: query.max_start }),
        alias: ['product.', 'subproducts.'],
      },
      {
        field: 'end_date',
        ...configRangeFilterAlias({ min_value: query.min_end, max_value: query.max_end }),
        alias: ['product.', 'subproducts.'],
      },
      {
        field: 'updated_at',
        ...configRangeFilterAlias({ min_value: query.min_updated, max_value: query.max_updated }),
        alias: ['product.', 'subproducts.'],
      },
    ];

    const sortConfig: ISortConfig = {
      id: { field: 'id', alias: ['product.'], subField: ['id'] },
      name: { field: 'name', alias: ['product.'], subField: ['name'] },
      deadline: { field: 'deadline', alias: ['product.'], subField: ['deadline'] },
      available_date: { field: 'availableDate', alias: ['product.'], subField: ['availableDate'] },
      start_date: { field: 'startDate', alias: ['product.'], subField: ['startDate'] },
      end_date: { field: 'endDate', alias: ['product.'], subField: ['endDate'] },
      updated_at: { field: 'updated_at', alias: ['product.'], subField: ['updated_at'] },
      created_at: { field: 'created_at', alias: ['product.'], subField: ['created_at'] },
      project: { field: 'name', alias: ['project.'] },
      product_type: { field: 'name', alias: ['productType.'], subField: ['productType', 'name'] },
      measure: { field: 'name', alias: ['measure.'], subField: ['measure', 'name'] },
      quantity: { field: 'quantity', alias: ['product.'], subField: ['quantity'] },
    };

    const sort = sortConfig[query.sort_by];

    const [products, total_results] = await this.productsRepository.findAllPagination({
      organization_id,
      page: query.page,
      sort_by: sort,
      order_by: query.order_by,
      filters,
      customFilters: [
        configStatusDatesFilters({
          statusDate: query.status_date,
          entitiesAlias: ['product.', 'subproducts.'],
        }),
      ],
    });

    let productSorted = products;

    if (sort.subField) {
      productSorted = products.map(product => {
        return {
          ...product,
          subproducts: product.subproducts.sort((a, b) => {
            const order = query.order_by === 'ASC' ? 1 : -1;

            return sortSubFunction(
              getDynamicField({ fields: sort.subField, object: a }),
              getDynamicField({ fields: sort.subField, object: b }),
              order,
            );
          }),
        };
      });
    }

    const productsWithStatus = productSorted.map(product => ({
      ...product,
      statusDate: getStatusDate(product),
      pathString: getParentPathString({
        entity: product,
        getCustomer: true,
        entityType: 'product',
        skipFirstName: true,
      }),
      path: getParentPath({
        entity: product,
        getCustomer: true,
        entityType: 'product',
        includeEntity: true,
      }),
      subproducts: product.subproducts.map(subproduct => ({
        ...subproduct,
        statusDate: getStatusDate(subproduct),
        deadline: undefined,
        startDate: undefined,
        endDate: undefined,
        availableDate: undefined,
        created_at: undefined,
        updated_at: undefined,
        productType: undefined,
        measure: undefined,
        quantity: undefined,
      })),
      project: undefined,
      productParent: undefined,
      deadline: undefined,
      startDate: undefined,
      endDate: undefined,
      availableDate: undefined,
      created_at: undefined,
      updated_at: undefined,
      productType: undefined,
      measure: undefined,
      quantity: undefined,
    }));

    return {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSize),
      },
      data: productsWithStatus,
    };
  }

  async findReport({ organization_id, query }: IFindReport) {
    const filters: IFilterValueAlias[] = [
      {
        field: 'name',
        values: [query.name],
        operation: 'like',
        alias: ['product.', 'subproducts.'],
      },
      { field: 'project_id', values: [query.project_id], operation: 'equal', alias: ['product.'] },
      {
        field: 'product_type_id',
        values: [query.product_type_id],
        operation: 'equal',
        alias: ['product.', 'subproducts.'],
      },
    ];

    const filtersIncludeConfig = {
      inProgress: new Brackets(q => {
        q.where(
          new Brackets(q2 => {
            q2.where('subTasks.start_date is not null')
              .andWhere('subTasks.end_date is null')
              .andWhere('subproductsValueChains.id is not null');
          }),
        );

        q.orWhere(
          new Brackets(q2 => {
            q2.where('tasks.start_date is not null')
              .andWhere('tasks.end_date is null')
              .andWhere('valueChains.id is not null');
          }),
        );
      }),
      available: new Brackets(q => {
        q.where(
          new Brackets(q2 => {
            q2.where('subTasks.available_date is not null')
              .andWhere('subTasks.start_date is null')
              .andWhere('subproductsValueChains.id is not null');
          }),
        );

        q.orWhere(
          new Brackets(q2 => {
            q2.where('tasks.available_date is not null')
              .andWhere('tasks.start_date is null')
              .andWhere('valueChains.id is not null');
          }),
        );
      }),
      first: new Brackets(q => {
        q.where(
          new Brackets(q2 => {
            q2.where('subTasks.available_date is null')
              .andWhere('subPreviousTasks.id is null')
              .andWhere('subproductsValueChains.id is not null');
          }),
        );

        q.orWhere(
          new Brackets(q2 => {
            q2.where('tasks.available_date is null')
              .andWhere('previousTasks.id is null')
              .andWhere('valueChains.id is not null');
          }),
        );
      }),
      last: new Brackets(q => {
        q.where(
          new Brackets(q2 => {
            q2.where('subTasks.end_date is not null')
              .andWhere('subNextTasks.id is null')
              .andWhere('subproductsValueChains.id is not null');
          }),
        );

        q.orWhere(
          new Brackets(q2 => {
            q2.where('tasks.end_date is not null')
              .andWhere('nextTasks.id is null')
              .andWhere('valueChains.id is not null');
          }),
        );
      }),
    };

    const filtersInclude: ICustomFilters = [filtersIncludeConfig.inProgress];

    if (query.includeAvailable) {
      filtersInclude.push(filtersIncludeConfig.available);
    }

    if (query.includeFirst) {
      filtersInclude.push(filtersIncludeConfig.first);
    }

    if (query.includeLast) {
      filtersInclude.push(filtersIncludeConfig.last);
    }

    const sort: ISortValue = {
      field: 'name',
      alias: ['product.'],
    };

    const [products, total_results] = await this.productsRepository.findTabelaFluxos({
      organization_id,
      order_by: 'ASC',
      page: query.page,
      sort_by: sort,
      filters,
      customFilters: [
        filtersInclude,
        [
          configStatusDatesFilters({
            statusDate: query.status_date,
            entitiesAlias: ['product.', 'subproducts.'],
          }),
        ],
      ],
    });

    const apiData = products.map(product => {
      const sortByName = (a: { name: string }, b: { name: string }) =>
        a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? -1 : 1;

      const subproductsSorted = product.subproducts.sort(sortByName);

      if (product.valueChains.length > 0) {
        subproductsSorted.unshift({
          id: product.id,
          name: '-',
          valueChains: product.valueChains,
        } as any);
      }

      const subproducts = subproductsSorted.map(subproduct => {
        const valueChains = subproduct.valueChains.sort(sortByName).map(valueChain => {
          const tasksWithStatus = valueChain.tasks.map(task => ({
            ...task,
            statusDate: getStatusDate(task),
            commentsReport: task.commentsReport.filter(
              ({ reportName }) => reportName === 'tabela_fluxos',
            ),
          }));

          const tasksReport = tasksWithStatus.filter(task => {
            if (task.statusDate.status === StatusDate.started) {
              return true;
            }

            if (query.includeAvailable && task.statusDate.status === StatusDate.available) {
              return true.valueOf;
            }

            if (query.includeLast) {
              const last =
                task.statusDate.status === StatusDate.ended &&
                !task.nextTasks.find(nextTask => nextTask.value_chain_id === valueChain.id);

              if (last) {
                return true;
              }
            }

            if (query.includeFirst) {
              const first =
                task.statusDate.status === StatusDate.created &&
                !task.previousTasks.find(prevTask => prevTask.value_chain_id === valueChain.id);

              if (first) {
                return true;
              }
            }

            return false;
          });

          return {
            ...valueChain,
            tasks: tasksReport.sort(sortByName).map(taskRep => ({
              id: taskRep.id,
              name: taskRep.name,
              deadline: taskRep.deadline,
              assignments: taskRep.assignments,
              statusDate: taskRep.statusDate,
              hasComments: taskRep.commentsReport.some(({ id }) => id),
            })),
          };
        });

        return {
          id: subproduct.id,
          name: subproduct.name,
          valueChains,
        };
      });

      return {
        id: product.id,
        name: product.name,
        path: getParentPath({
          entity: product,
          entityType: 'product',
          getCustomer: true,
          includeEntity: true,
        }),
        subproducts,
      };
    });

    const response: IResponsePagination<any> = {
      pagination: {
        page: query.page,
        total_results,
        total_pages: Math.ceil(total_results / paginationSizeSmall),
      },
      data: apiData,
    };

    return response;
  }
}
