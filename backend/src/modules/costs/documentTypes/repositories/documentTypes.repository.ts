import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { IFindLimited, IFindPagination, paginationSizeLarge } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';

import { DocumentTypeCost } from '../entities/DocumentType';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string };
type ICreateDocumentType = { name: string; organization_id: string };

const limitedDocumentTypesLength = 100;

@Injectable()
export class DocumentTypesRepository {
  constructor(
    @InjectRepository(DocumentTypeCost)
    private repository: Repository<DocumentTypeCost>,
  ) {}

  async findById({ id, relations }: IFindByIdProps) {
    return this.repository.findOne(id, { relations });
  }

  async findAllPagination({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindPagination) {
    const query = this.repository
      .createQueryBuilder('documentType')
      .where({ organization_id })
      .select(['documentType.id', 'documentType.name'])
      .take(paginationSizeLarge)
      .skip((page - 1) * paginationSizeLarge);

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findAllLimited({ filters, organization_id, customFilters }: IFindLimited) {
    const query = this.repository
      .createQueryBuilder('documentType')
      .select(['documentType.id', 'documentType.name'])
      .orderBy('documentType.name', 'ASC')
      .where({ organization_id })
      .take(limitedDocumentTypesLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findByName({ name, organization_id }: IFindByName) {
    return this.repository.findOne({
      where: { name: Raw(alias => `${alias} ilike '${name}'`), organization_id },
    });
  }

  async create(data: ICreateDocumentType) {
    const documentType = this.repository.create(data);

    await this.repository.save(documentType);

    return documentType;
  }

  async delete(documentType: DocumentTypeCost) {
    await this.repository.remove(documentType);
  }

  async save(documentType: DocumentTypeCost) {
    return this.repository.save(documentType);
  }
}
