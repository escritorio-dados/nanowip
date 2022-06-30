import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { getParentPathQuery } from '@shared/utils/getParentPath';
import { getFieldsQuery } from '@shared/utils/selectFields';

import { Deliverable } from '../entities/Deliverable';
import { ICreateDeliverableRepository } from './types';

type IFindByIdProps = { id: string; relations?: string[] };

type IFindAllBySection = { objective_section_id: string; organization_id: string };

@Injectable()
export class DeliverablesRepository {
  constructor(
    @InjectRepository(Deliverable)
    private repository: Repository<Deliverable>,
  ) {}

  async findAllBySectionInfo({ objective_section_id, organization_id }: IFindAllBySection) {
    return this.repository
      .createQueryBuilder('deliverable')
      .leftJoin('deliverable.valueChains', 'valueChains')
      .leftJoin('valueChains.tasks', 'tasks')
      .where({ objective_section_id, organization_id })
      .select([
        ...getFieldsQuery(
          ['deliverable'],
          ['id', 'name', 'position', 'progress', 'goal', 'objective_section_id', 'deadline'],
        ),
        ...getFieldsQuery(['valueChains'], ['id', 'name']),
        ...getFieldsQuery(['tasks'], ['id', 'name', 'endDate']),
      ])
      .orderBy('deliverable.position', 'ASC')
      .getMany();
  }

  async findAllBySection({ objective_section_id, organization_id }: IFindAllBySection) {
    return this.repository.find({
      where: { objective_section_id, organization_id },
      order: { position: 'ASC' },
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
      .where({ id })
      .select([
        'deliverable',
        ...getFieldsQuery(['valueChains', 'product', 'productParent'], ['id', 'name']),
        ...getFieldsQuery(['tasks'], ['id', 'name', 'endDate']),
      ]);

    getParentPathQuery({ query, entityType: 'product', getCustomer: true });

    return query.getOne();
  }

  async getLastPosition(objective_section_id: string) {
    const { lastPosition }: { lastPosition: number } = await this.repository
      .createQueryBuilder('deliverable')
      .select('MAX(deliverable.position)', 'lastPosition')
      .where({ objective_section_id })
      .getRawOne();

    return lastPosition || 0;
  }

  async create(data: ICreateDeliverableRepository) {
    const deliverable = this.repository.create(data);

    await this.repository.save(deliverable);

    return deliverable;
  }

  async delete(deliverable: Deliverable) {
    await this.repository.remove(deliverable);
  }

  async save(deliverable: Deliverable) {
    return this.repository.save(deliverable);
  }

  async saveMany(objectiveCategories: Deliverable[]) {
    return this.repository.save(objectiveCategories);
  }
}
