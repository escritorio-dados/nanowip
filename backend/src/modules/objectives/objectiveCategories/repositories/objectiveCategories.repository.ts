import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { getPathQueryObjectives } from '@shared/utils/getParentPathObjectives';
import { getFieldsQuery } from '@shared/utils/selectFields';

import { ObjectiveCategory } from '../entities/ObjectiveCategory';
import { ICreateObjectiveCategoryRepository } from './types';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string; operational_objective_id: string };

type IFindAllByObjective = { operational_objective_id: string; organization_id: string };

@Injectable()
export class ObjectiveCategoriesRepository {
  constructor(
    @InjectRepository(ObjectiveCategory)
    private repository: Repository<ObjectiveCategory>,
  ) {}

  async findAllByObjectiveInfo({ operational_objective_id, organization_id }: IFindAllByObjective) {
    return this.repository
      .createQueryBuilder('objectiveCategory')
      .where({ operational_objective_id, organization_id })
      .select(getFieldsQuery(['objectiveCategory'], ['id', 'name', 'position', 'type']))
      .orderBy('objectiveCategory.position', 'ASC')
      .getMany();
  }

  async findAllByObjective({ operational_objective_id, organization_id }: IFindAllByObjective) {
    return this.repository.find({
      where: { operational_objective_id, organization_id },
      order: { position: 'ASC' },
    });
  }

  async findById({ id, relations }: IFindByIdProps) {
    return this.repository.findOne(id, { relations });
  }

  async getInfo(id: string) {
    const query = this.repository
      .createQueryBuilder('objectiveCategory')
      .select('objectiveCategory')
      .where({ id });

    getPathQueryObjectives({
      entityType: 'objectiveCategory',
      getIntegratedObjective: true,
      query,
    });

    return query.getOne();
  }

  async findByName({ name, organization_id, operational_objective_id }: IFindByName) {
    return this.repository.findOne({
      where: {
        name: Raw(alias => `${alias} ilike '${name}'`),
        organization_id,
        operational_objective_id,
      },
    });
  }

  async getLastPosition(operational_objective_id: string) {
    const { lastPosition }: { lastPosition: number } = await this.repository
      .createQueryBuilder('objectiveCategory')
      .select('MAX(objectiveCategory.position)', 'lastPosition')
      .where({ operational_objective_id })
      .getRawOne();

    return lastPosition || 0;
  }

  async create(data: ICreateObjectiveCategoryRepository) {
    const objectiveCategory = this.repository.create(data);

    await this.repository.save(objectiveCategory);

    return objectiveCategory;
  }

  async delete(objectiveCategory: ObjectiveCategory) {
    await this.repository.remove(objectiveCategory);
  }

  async save(objectiveCategory: ObjectiveCategory) {
    return this.repository.save(objectiveCategory);
  }

  async saveMany(objectiveCategories: ObjectiveCategory[]) {
    return this.repository.save(objectiveCategories);
  }
}
