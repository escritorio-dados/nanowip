import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { IFindLimited } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';

import { Task } from '../entities/Task';
import { ICreateTaskRepository } from './types';

type IFindAll = { relations?: string[]; organization_id: string };

type IFindAllByKeys = { ids: string[]; key: string; organization_id: string; relations?: string[] };

type IFindAllGraph = { value_chain_id: string; organization_id: string };
type IFindExtraGraph = { extra_task_ids: string[] };

type IFindAllLimited = IFindLimited & { value_chain_id: string };

const limitedTasksLength = 100;

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private repository: Repository<Task>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findToDelete(id: string) {
    const query = this.repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.previousTasks', 'previousTasks')
      .leftJoinAndSelect('task.nextTasks', 'nextTasks')
      .leftJoinAndSelect('previousTasks.nextTasks', 'previousTasksNextTasks')
      .leftJoinAndSelect('previousTasks.previousTasks', 'previousTasksPreviousTasks')
      .leftJoinAndSelect('task.assignments', 'assignments')
      .where({ id });

    return query.getOne();
  }

  async findNextTasks(id: string) {
    const query = this.repository
      .createQueryBuilder('task')
      .leftJoin('task.nextTasks', 'nextTasks')
      .leftJoin('nextTasks.previousTasks', 'nextTasksPreviousTasks')
      .leftJoin('nextTasks.nextTasks', 'nextTasksNextTasks')
      .select(['task', 'nextTasks', 'nextTasksPreviousTasks', 'nextTasksNextTasks'])
      .where({ id });

    return query.getOne();
  }

  async findManyNextTasks(ids: string[]) {
    const query = this.repository
      .createQueryBuilder('task')
      .leftJoin('task.nextTasks', 'nextTasks')
      .leftJoin('task.previousTasks', 'previousTasks')
      .select(['nextTasks', 'previousTasks', 'task'])
      .where('previousTasks.id IN (:...ids)', { ids });

    return query.getMany();
  }

  async findByIdInfo(id: string) {
    const entities = [
      'taskType',
      'nextTasks',
      'previousTasks',
      'nextTasksValueChain',
      'previousTasksValueChain',
      'nextTasksValueChainProduct',
      'previousTasksValueChainProduct',
    ];

    const fields = entities.flatMap(entity => ['id', 'name'].map(field => `${entity}.${field}`));

    const query = this.repository
      .createQueryBuilder('task')
      .leftJoin('task.taskType', 'taskType')
      .leftJoin('task.nextTasks', 'nextTasks')
      .leftJoin('task.previousTasks', 'previousTasks')
      .leftJoin('nextTasks.valueChain', 'nextTasksValueChain')
      .leftJoin('previousTasks.valueChain', 'previousTasksValueChain')
      .leftJoin('nextTasksValueChain.product', 'nextTasksValueChainProduct')
      .leftJoin('previousTasksValueChain.product', 'previousTasksValueChainProduct')
      .where({ id })
      .select(['task', ...fields]);

    getParentPathQuery({ entityType: 'task', query, getCustomer: true });

    return query.getOne();
  }

  async findAll({ organization_id, relations }: IFindAll) {
    return this.repository.find({ where: { organization_id }, order: { name: 'ASC' }, relations });
  }

  async findAllLimited({
    filters,
    organization_id,
    value_chain_id,
    customFilters,
  }: IFindAllLimited) {
    const query = this.repository
      .createQueryBuilder('task')
      .leftJoin('task.valueChain', 'valueChain')
      .leftJoin('valueChain.product', 'product')
      .select(['task.id', 'task.name', 'valueChain.name', 'product.name'])
      .orderBy('task.name', 'ASC')
      .where({ organization_id, value_chain_id })
      .take(limitedTasksLength);

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getMany();
  }

  async findAllGraph({ value_chain_id, organization_id }: IFindAllGraph) {
    const fieldsEntity = ['id', 'name', 'deadline', 'availableDate', 'startDate', 'endDate'];

    const othersFields = ['id', 'name', 'value_chain_id'];

    const fields = [
      ...fieldsEntity.map(field => `task.${field}`),
      ...othersFields.map(field => `nextTasks.${field}`),
      ...othersFields.map(field => `previousTasks.${field}`),
      'assignments.id',
    ];
    const query = this.repository
      .createQueryBuilder('task')
      .leftJoin('task.nextTasks', 'nextTasks')
      .leftJoin('task.previousTasks', 'previousTasks')
      .leftJoin('task.assignments', 'assignments')
      .where({ organization_id, value_chain_id })
      .select(fields);

    return query.getMany();
  }

  async findExtraGraph({ extra_task_ids }: IFindExtraGraph) {
    const fieldsEntity = ['id', 'name', 'deadline', 'availableDate', 'startDate', 'endDate'];

    const fields = [
      ...fieldsEntity.map(field => `task.${field}`),
      'assignments.id',
      'collaborator.id',
      'collaborator.name',
    ];

    const query = this.repository
      .createQueryBuilder('task')
      .leftJoin('task.assignments', 'assignments')
      .leftJoin('assignments.collaborator', 'collaborator')
      .where({ id: In(extra_task_ids) })
      .select(fields);

    getParentPathQuery({ query, entityType: 'task', getProduct: true });

    return query.getMany();
  }

  async findAllByKeys({ ids, key, organization_id, relations }: IFindAllByKeys) {
    return this.repository.find({
      where: { [key]: In(ids), organization_id },
      relations,
      order: { name: 'ASC' },
    });
  }

  async findByName(name: string, value_chain_id: string) {
    return this.repository
      .createQueryBuilder('s')
      .where('Lower(s.name) = :name', { name: name.toLowerCase() })
      .andWhere('s.value_chain_id = :value_chain_id', { value_chain_id })
      .getOne();
  }

  async create(data: ICreateTaskRepository) {
    const task = this.repository.create(data);

    await this.repository.save(task);

    return task;
  }

  async delete(task: Task) {
    await this.repository.remove(task);
  }

  async deleteMany(tasks: Task[]) {
    await this.repository.remove(tasks);
  }

  async save(task: Task) {
    return this.repository.save(task);
  }

  async saveAll(tasks: Task[]) {
    return this.repository.save(tasks);
  }
}
