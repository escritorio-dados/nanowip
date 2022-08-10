import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { getParentPathQuery } from '@shared/utils/getParentPath';
import { getFieldsQuery } from '@shared/utils/selectFields';

import { DeliverableTag } from '../entities/DeliverableTag';
import { ICreateDeliverableTagRepository } from './types';

type IFindByIdProps = { id: string; relations?: string[] };

type IFindAllBySection = { objective_category_id: string; organization_id: string };

@Injectable()
export class DeliverableTagsRepository {
  constructor(
    @InjectRepository(DeliverableTag)
    private repository: Repository<DeliverableTag>,
  ) {}

  async findAllByCategoryInfo({ objective_category_id, organization_id }: IFindAllBySection) {
    return this.repository
      .createQueryBuilder('deliverable')
      .leftJoin('deliverable.valueChains', 'valueChains')
      .leftJoin('valueChains.tasks', 'tasks')
      .leftJoin('tasks.tagsGroup', 'tagsGroup')
      .leftJoin('tagsGroup.tags', 'tags')
      .where({ objective_category_id, organization_id })
      .select([
        ...getFieldsQuery(
          ['deliverable'],
          ['id', 'name', 'progress', 'goal', 'objective_category_id', 'deadline'],
        ),
        ...getFieldsQuery(['valueChains', 'tags'], ['id', 'name']),
        ...getFieldsQuery(['tasks'], ['id', 'name', 'endDate', 'startDate', 'availableDate']),
        ...getFieldsQuery(['tagsGroup'], ['id']),
      ])
      .getMany();
  }

  async findAllByCategory({ objective_category_id, organization_id }: IFindAllBySection) {
    return this.repository.find({
      where: { objective_category_id, organization_id },
      order: { name: 'ASC' },
    });
  }

  async findById({ id, relations }: IFindByIdProps) {
    return this.repository.findOne(id, { relations });
  }

  async getInfo(id: string) {
    const query = this.repository
      .createQueryBuilder('deliverable')
      .leftJoin('deliverable.valueChains', 'valueChains')
      .leftJoin('valueChains.tasks', 'tasks')
      .leftJoin('valueChains.product', 'product')
      .leftJoin('tasks.tagsGroup', 'tagsGroup')
      .leftJoin('tagsGroup.tags', 'tags')
      .where({ id })
      .select([
        'deliverable',
        ...getFieldsQuery(['valueChains', 'product', 'productParent', 'tags'], ['id', 'name']),
        ...getFieldsQuery(['tasks'], ['id', 'name', 'endDate', 'availableDate', 'startDate']),
        'tagsGroup.id',
      ]);

    getParentPathQuery({ query, entityType: 'product', getCustomer: true });

    return query.getOne();
  }

  async create(data: ICreateDeliverableTagRepository) {
    const deliverable = this.repository.create(data);

    await this.repository.save(deliverable);

    return deliverable;
  }

  async delete(deliverable: DeliverableTag) {
    await this.repository.remove(deliverable);
  }

  async save(deliverable: DeliverableTag) {
    return this.repository.save(deliverable);
  }

  async saveMany(deliverables: DeliverableTag[]) {
    return this.repository.save(deliverables);
  }
}
