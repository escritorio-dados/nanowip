import { Injectable } from '@nestjs/common';

import { IResponsePagination, paginationSize } from '@shared/types/pagination';
import { IFilterValueAlias } from '@shared/utils/filter/configFiltersRepository';
import { configRangeFilterAlias } from '@shared/utils/filter/configRangeFilter';
import { ISortConfig, sortSubFunction } from '@shared/utils/filter/configSortRepository';
import { configStatusDatesFilters } from '@shared/utils/filter/configStatusDateFilter';
import { getDynamicField } from '@shared/utils/getDynamicField';
import { getParentPath, getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Product } from '@modules/products/entities/Product';
import { ProductsRepository } from '@modules/products/repositories/products.repository';

import { FindAllLimitedProductsQuery } from '../query/findAllLimited.product.query';
import { FindPaginationProductQuery } from '../query/findPagination.product.query';

type IFindAllProductService = {
  projects_id?: string[];
  product_parents_id?: string[];
  organization_id: string;

  onlyRoot?: boolean;
  project_id?: string;
  product_parent_id?: string;
  product_type_id?: string;
  measure_id?: string;
};

type IFindAllPagination = { query: FindPaginationProductQuery; organization_id: string };
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

  async execute({
    organization_id,
    measure_id,
    onlyRoot,
    product_parent_id,
    product_parents_id,
    product_type_id,
    project_id,
    projects_id,
  }: IFindAllProductService): Promise<Product[]> {
    // Buscando todos os produtos de um projeto especifico
    if (project_id) {
      const products = await this.productsRepository.findAllByProject(project_id);

      if (products.length > 0) {
        validateOrganization({ entity: products[0], organization_id });
      }

      return products;
    }

    // Buscando todos os produtos de varios projetos
    if (projects_id) {
      const products = await this.productsRepository.findAllByManyProject(projects_id);

      if (products.length > 0) {
        validateOrganization({ entity: products[0], organization_id });
      }

      return products;
    }

    // Buscando todos os subprodutos de um produto especifico
    if (product_parent_id) {
      const products = await this.productsRepository.findAllByProductParent(product_parent_id);

      if (products.length > 0) {
        validateOrganization({ entity: products[0], organization_id });
      }

      return products;
    }

    // Buscando todos os subprodutos de varios produtos
    if (product_parents_id) {
      const products = await this.productsRepository.findAllByManyProductParent(product_parents_id);

      if (products.length > 0) {
        validateOrganization({ entity: products[0], organization_id });
      }

      return products;
    }

    // Buscando todos os produtos de um determinado tipo de produto
    if (product_type_id) {
      const products = await this.productsRepository.findAllByProductType(product_type_id, {
        onlyRoot,
      });

      if (products.length > 0) {
        validateOrganization({ entity: products[0], organization_id });
      }

      return products;
    }

    // Buscando todos os produtos que utilizam uma determinada unidade de medida
    if (measure_id) {
      const products = await this.productsRepository.findAllByMeasure(measure_id, {
        onlyRoot,
      });

      if (products.length > 0) {
        validateOrganization({ entity: products[0], organization_id });
      }

      return products;
    }

    return this.productsRepository.findAll({ onlyRoot, organization_id });
  }
}
