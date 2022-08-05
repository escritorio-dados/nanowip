import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';

import { IFindLimited } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';

import { TaskTrail } from '../entities/TaskTrail';
import { ICreateTaskTrailRepository } from './types';

type IFindAllGraph = { trail_id: string; organization_id: string };

type IFindAllLimited = IFindLimited & { trail_id: string };

type IFindAllByKeys = { ids: string[]; key: string; organization_id: string; relations?: string[] };

const limitedTaskTrailsLength = 100;

@Injectable()
export class TaskTrailsRepository {
  constructor(
    @InjectRepository(TaskTrail)
    private repository: Repository<TaskTrail>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findAllLimited({ filters, organization_id, trail_id, customFilters }: IFindAllLimited) {
    const query = this.repository
      .createQueryBuilder('taskTrail')
      .select(['taskTrail.id', 'taskTrail.name'])
      .orderBy('taskTrail.name', 'ASC')
      .where({ organization_id, trail_id })
      .take(limitedTaskTrailsLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findAllGraph({ trail_id, organization_id }: IFindAllGraph) {
    const fieldsEntity = ['id', 'name', 'task_type_id'];

    const othersFields = ['id', 'name', 'task_type_id'];

    const fields = [
      ...fieldsEntity.map(field => `task.${field}`),
      ...othersFields.map(field => `nextTasks.${field}`),
      ...othersFields.map(field => `previousTasks.${field}`),
    ];

    const query = this.repository
      .createQueryBuilder('task')
      .leftJoin('task.nextTasks', 'nextTasks')
      .leftJoin('task.previousTasks', 'previousTasks')
      .where({ organization_id, trail_id })
      .select(fields);

    return query.getMany();
  }

  async findAllInstantiate({ trail_id, organization_id }: IFindAllGraph) {
    const fieldsEntity = ['id', 'name', 'task_type_id'];

    const othersFields = ['id', 'name', 'task_type_id'];

    const fields = [
      ...fieldsEntity.map(field => `task.${field}`),
      ...othersFields.map(field => `nextTasks.${field}`),
      ...othersFields.map(field => `previousTasks.${field}`),
      'tagsGroup.id',
      'tags.name',
    ];

    const query = this.repository
      .createQueryBuilder('task')
      .leftJoin('task.nextTasks', 'nextTasks')
      .leftJoin('task.previousTasks', 'previousTasks')
      .leftJoin('task.tagsGroup', 'tagsGroup')
      .leftJoin('tagsGroup.tags', 'tags')
      .where({ organization_id, trail_id })
      .select(fields);

    return query.getMany();
  }

  async findAllByKeys({ ids, key, organization_id, relations }: IFindAllByKeys) {
    return this.repository.find({
      where: { [key]: In(ids), organization_id },
      relations,
      order: { name: 'ASC' },
    });
  }

  async findToDelete(id: string) {
    const query = this.repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.previousTasks', 'previousTasks')
      .leftJoinAndSelect('task.nextTasks', 'nextTasks')
      .leftJoinAndSelect('previousTasks.nextTasks', 'previousTasksNextTasks')
      .leftJoinAndSelect('previousTasks.previousTasks', 'previousTasksPreviousTasks')
      .where({ id });

    return query.getOne();
  }

  async findByName(name: string, trail_id: string) {
    return this.repository
      .createQueryBuilder('s')
      .where('Lower(s.name) = :name', { name: name.toLowerCase() })
      .andWhere('s.trail_id = :trail_id', { trail_id })
      .getOne();
  }

  async create(data: ICreateTaskTrailRepository, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(TaskTrail) : this.repository;

    const taskTrail = repo.create(data);

    await repo.save(taskTrail);

    return taskTrail;
  }

  async delete(taskTrail: TaskTrail, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(TaskTrail) : this.repository;

    await repo.remove(taskTrail);
  }

  async deleteMany(taskTrails: TaskTrail[], manager?: EntityManager) {
    const repo = manager ? manager.getRepository(TaskTrail) : this.repository;

    await repo.remove(taskTrails);
  }

  async save(taskTrail: TaskTrail, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(TaskTrail) : this.repository;

    return repo.save(taskTrail);
  }

  async saveAll(taskTrails: TaskTrail[], manager?: EntityManager) {
    const repo = manager ? manager.getRepository(TaskTrail) : this.repository;

    return repo.save(taskTrails);
  }
}
