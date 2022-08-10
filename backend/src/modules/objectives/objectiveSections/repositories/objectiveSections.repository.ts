import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Raw, Repository } from 'typeorm';

import { getFieldsQuery } from '@shared/utils/selectFields';

import { ObjectiveSection } from '../entities/ObjectiveSection';
import { ICreateObjectiveSectionRepository } from './types';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string; objective_category_id: string };

type IFindAllByCategory = { objective_category_id: string; organization_id: string };

@Injectable()
export class ObjectiveSectionsRepository {
  constructor(
    @InjectRepository(ObjectiveSection)
    private repository: Repository<ObjectiveSection>,
  ) {}

  async findAllByCategoryInfo({ objective_category_id, organization_id }: IFindAllByCategory) {
    return this.repository
      .createQueryBuilder('objectiveSection')
      .leftJoin('objectiveSection.deliverables', 'deliverables')
      .leftJoin('deliverables.valueChains', 'valueChains')
      .leftJoin('valueChains.tasks', 'tasks')
      .where({ objective_category_id, organization_id })
      .select([
        ...getFieldsQuery(['objectiveSection'], ['id', 'name', 'position']),
        ...getFieldsQuery(
          ['deliverables'],
          ['id', 'name', 'position', 'progress', 'goal', 'objective_section_id', 'deadline'],
        ),
        ...getFieldsQuery(['valueChains'], ['id', 'name']),
        ...getFieldsQuery(['tasks'], ['id', 'name', 'endDate']),
      ])
      .orderBy('objectiveSection.position', 'ASC')
      .addOrderBy('deliverables.position', 'ASC')
      .getMany();
  }

  async findAllByCategoryTagsInfo({ objective_category_id, organization_id }: IFindAllByCategory) {
    return this.repository
      .createQueryBuilder('objectiveSection')
      .leftJoin('objectiveSection.tagsGroup', 'tagsGroup')
      .leftJoin('tagsGroup.tags', 'tags')
      .where({ objective_category_id, organization_id })
      .select([
        ...getFieldsQuery(['objectiveSection'], ['id', 'name', 'position']),
        ...getFieldsQuery(['tagsGroup'], ['id']),
        ...getFieldsQuery(['tags'], ['id', 'name']),
      ])
      .orderBy('objectiveSection.position', 'ASC')
      .getMany();
  }

  async findAllByCategory({ objective_category_id, organization_id }: IFindAllByCategory) {
    return this.repository.find({
      where: { objective_category_id, organization_id },
      order: { position: 'ASC' },
    });
  }

  async findById({ id, relations }: IFindByIdProps) {
    return this.repository.findOne(id, { relations });
  }

  async findByName({ name, organization_id, objective_category_id }: IFindByName) {
    return this.repository.findOne({
      where: {
        name: Raw(alias => `${alias} ilike '${name}'`),
        organization_id,
        objective_category_id,
      },
    });
  }

  async getLastPosition(objective_category_id: string) {
    const { lastPosition }: { lastPosition: number } = await this.repository
      .createQueryBuilder('objectiveSection')
      .select('MAX(objectiveSection.position)', 'lastPosition')
      .where({ objective_category_id })
      .getRawOne();

    return lastPosition || 0;
  }

  async create(data: ICreateObjectiveSectionRepository, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(ObjectiveSection) : this.repository;

    const objectiveSection = repo.create(data);

    await repo.save(objectiveSection);

    return objectiveSection;
  }

  async createMany(data: ICreateObjectiveSectionRepository[]) {
    const objectiveSection = this.repository.create(data);

    await this.repository.save(objectiveSection);

    return objectiveSection;
  }

  async delete(objectiveSection: ObjectiveSection, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(ObjectiveSection) : this.repository;

    await repo.remove(objectiveSection);
  }

  async save(objectiveSection: ObjectiveSection, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(ObjectiveSection) : this.repository;

    return repo.save(objectiveSection);
  }

  async saveMany(objectiveCategories: ObjectiveSection[]) {
    return this.repository.save(objectiveCategories);
  }
}
