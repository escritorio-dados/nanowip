import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, FindManyOptions, IsNull, Not, MoreThanOrEqual } from 'typeorm';

import { paginationSize } from '@shared/types/pagination';
import {
  configFiltersQuery,
  ICustomFilters,
  IFilterValueAlias,
} from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository, ISortValue } from '@shared/utils/filter/configSortRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';

import { ICreateAssignmentRepositoryDto } from '../dtos/create.assignment.repository.dto';
import { Assignment } from '../entities/Assignment';
import { StatusAssignment } from '../enums/status.assignment.enum';

type IFindAll = { organization_id: string; relations?: string[] };
type IFindAllByStatys = { status: StatusAssignment; organization_id: string };

type IFindAllByCollaboratorsIds = {
  collaborator_ids: string[];
  available?: boolean;
  closed?: boolean;
  daysLimit?: number;
};

type IFindAllPagination = {
  organization_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};

type IFindClosedPersonalPagination = {
  organization_id: string;
  collaborator_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};

type IFindAllLimited = {
  organization_id: string;
  collaborator_id: string;
  filters?: IFilterValueAlias[];
};

type IFindAvailablePersonal = { organization_id: string; collaborator_id: string };

const limitedAssignmentsLength = 100;

type IFindAllByTaskInfo = { task_id: string; organization_id: string };

type IFindAllByKeys = {
  ids: string[];
  key: string;
  relations?: string[];
  organization_id: string;
};

@Injectable()
export class AssignmentsRepository {
  constructor(
    @InjectRepository(Assignment)
    private repository: Repository<Assignment>,
  ) {}

  async findAll({ organization_id, relations }: IFindAll) {
    return this.repository.find({ where: { organization_id }, relations });
  }

  async getInfo(id: string) {
    const query = this.repository
      .createQueryBuilder('assignment')
      .leftJoin('assignment.collaborator', 'collaborator')
      .leftJoin('assignment.trackers', 'trackers')
      .where({ id })
      .select([
        'assignment',
        'collaborator.id',
        'collaborator.name',
        'trackers.id',
        'trackers.start',
        'trackers.end',
        'task.deadline',
      ]);

    getParentPathQuery({ entityType: 'assignment', query, getCustomer: true });

    return query.getOne();
  }

  async findAllByTaskInfo({ organization_id, task_id }: IFindAllByTaskInfo) {
    const fields = ['assignment.id', 'assignment.status', 'collaborator.id', 'collaborator.name'];

    const query = this.repository
      .createQueryBuilder('assignment')
      .leftJoin('assignment.collaborator', 'collaborator')
      .select(fields)
      .where({ organization_id, task_id });

    return query.getMany();
  }

  async findAllLimitedOpen({ organization_id, collaborator_id, filters }: IFindAllLimited) {
    const query = this.repository
      .createQueryBuilder('assignment')
      .where({ organization_id, collaborator_id, status: 'Aberto' })
      .select(['assignment.id', 'task.availableDate'])
      .andWhere('task.availableDate is not null')
      .take(limitedAssignmentsLength);

    getParentPathQuery({ entityType: 'assignment', query, getCustomer: true });

    configFiltersQuery({ query, filters });

    return query.getMany();
  }

  async findClosedPersonalPagination({
    collaborator_id,
    organization_id,
    order_by,
    page,
    sort_by,
    filters,
  }: IFindClosedPersonalPagination) {
    const query = this.repository
      .createQueryBuilder('assignment')
      .where({ organization_id, collaborator_id, status: 'Fechado' })
      .select([
        'assignment.id',
        'assignment.endDate',
        'assignment.created_at',
        'assignment.updated_at',
      ])
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    getParentPathQuery({ entityType: 'assignment', query, getCustomer: true });

    query.leftJoin('task.nextTasks', 'nextTasks').andWhere('nextTasks.startDate is null');

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({ query, filters });

    return query.getManyAndCount();
  }

  async findAvailablePersonal({ collaborator_id, organization_id }: IFindAvailablePersonal) {
    const query = this.repository
      .createQueryBuilder('assignment')
      .leftJoin('assignment.trackers', 'trackers')
      .where({ organization_id, collaborator_id, status: 'Aberto' })
      .select([
        'assignment.id',
        'assignment.timeLimit',
        'task.availableDate',
        'task.deadline',
        'task.description',
        'task.link',
        'trackers.start',
        'trackers.end',
      ])
      .andWhere('task.availableDate is not null')
      .orderBy('task.deadline', 'ASC');

    getParentPathQuery({ entityType: 'assignment', query, getCustomer: true });

    return query.getMany();
  }

  async findAllPagination({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindAllPagination) {
    const fields = [
      'assignment.id',
      'assignment.status',
      'assignment.startDate',
      'assignment.endDate',
      'assignment.created_at',
      'assignment.updated_at',
      'collaborator.id',
      'collaborator.name',
      'trackers.end',
      'trackers.id',
      'task.deadline',
      'task.startDate',
      'task.endDate',
      'task.availableDate',
    ];

    const query = this.repository
      .createQueryBuilder('assignment')
      .leftJoin('assignment.collaborator', 'collaborator')
      .leftJoin('assignment.trackers', 'trackers')
      .where({ organization_id })
      .select(fields)
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    getParentPathQuery({ entityType: 'assignment', query, getCustomer: true });

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({ query, filters, customFilters });

    return query.getManyAndCount();
  }

  async findAllByKey({ ids, key, organization_id, relations }: IFindAllByKeys) {
    return this.repository.find({
      where: { [key]: In(ids), organization_id },
      relations,
    });
  }

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findAllByCollaboratorsIds({
    collaborator_ids,
    available,
    closed,
    daysLimit,
  }: IFindAllByCollaboratorsIds) {
    const config = {
      where: { collaborator_id: In(collaborator_ids), status: StatusAssignment.open },
    } as FindManyOptions<Assignment>;

    if (available || closed) {
      config.join = {
        alias: 'assignment',
        leftJoin: {
          task: 'assignment.task',
        },
      };

      if (available) {
        config.where['task'] = { availableDate: Not(IsNull()) };
      } else if (closed) {
        const date = new Date(new Date().getTime() - 3.6e6 * 24 * (daysLimit || 14));

        config.where['updated_at'] = MoreThanOrEqual(date);

        config.where['task'] = { endDateFixed: IsNull() };
      }
    }

    return this.repository.find(config);
  }

  /** Retornar Atribuições Disponiveis de um colaborador */
  async findAllAvailableByCollaborators(collaborator_id: string) {
    return this.repository
      .createQueryBuilder('a')
      .leftJoin('a.task', 't')
      .where('a.collaborator_id = :collaborator_id', { collaborator_id })
      .andWhere('a.status = :status', { status: StatusAssignment.open })
      .andWhere('t.availableDate is not null')
      .getMany();
  }

  /** Retornar Atribuições Fechadas nos ultimos 14 dias */
  async findAllCloseByCollaborators(collaborator_id: string) {
    const date = new Date();

    date.setDate(date.getDate() - 14);

    return this.repository
      .createQueryBuilder('a')
      .leftJoin('a.task', 't')
      .where('a.collaborator_id = :collaborator_id', { collaborator_id })
      .andWhere('a.status = :status', { status: StatusAssignment.close })
      .andWhere('a.updated_at >= :date', { date })
      .andWhere('t.endDateFixed is null')
      .getMany();
  }

  /** Retornar Atribuições Abertas ou Fechadas com validação de um colaborador */
  async findAllOpenByCollaborators(collaborator_id: string) {
    return this.repository.find({
      where: [{ collaborator_id, status: StatusAssignment.open }],
    });
  }

  async findAllByTask(task_id: string) {
    return this.repository.find({ where: { task_id } });
  }

  async findAllByStatus({ organization_id, status }: IFindAllByStatys) {
    return this.repository.find({ where: { status, organization_id } });
  }

  async findAllByManyTask(tasks_id: string[]) {
    return this.repository.find({ where: { task_id: In(tasks_id) } });
  }

  async findDuplicate(task_id: string, collaborator_id: string) {
    return this.repository.findOne({ where: { task_id, collaborator_id } });
  }

  async create(data: ICreateAssignmentRepositoryDto) {
    const assignment = this.repository.create(data);

    await this.repository.save(assignment);

    return assignment;
  }

  async save(assignment: Assignment) {
    return this.repository.save(assignment);
  }

  async saveAll(assignments: Assignment[]) {
    return this.repository.save(assignments);
  }

  async delete(assignment: Assignment) {
    await this.repository.remove(assignment);
  }

  async deleteMany(assignments: Assignment[]) {
    await this.repository.remove(assignments);
  }
}
