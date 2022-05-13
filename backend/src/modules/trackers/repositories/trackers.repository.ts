import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { setHours, setMinutes, setSeconds, subHours } from 'date-fns';
import { Between, In, IsNull, Repository, MoreThanOrEqual, Not, Brackets } from 'typeorm';

import { paginationSize } from '@shared/types/pagination';
import {
  configFiltersQuery,
  ICustomFilters,
  IFilterValueAlias,
} from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository, ISortValue } from '@shared/utils/filter/configSortRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';

import { ICreateTrackerRepositoryDto } from '../dtos/create.tracker.repository.dto';
import { Tracker } from '../entities/Tracker';

type IfindAllCollaboratorDateRelativeParams = {
  collaborator_id: string;
  date: Date;
  hoursBefore?: number;
};

type IFindAll = { organization_id: string };
type IFindAllByDate = { organization_id: string; date: Date };

type IFindAllPagination = {
  organization_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};

type IFindAllPersonal = {
  organization_id: string;
  collaborator_id: string;
  sort_by: ISortValue;
  order_by: 'ASC' | 'DESC';
  page: number;
  filters?: IFilterValueAlias[];
  customFilters?: ICustomFilters;
};

type IFindOnSamePeriod = { collaborator_id: string; start: Date; end: Date };

@Injectable()
export class TrackersRepository {
  constructor(
    @InjectRepository(Tracker)
    private repository: Repository<Tracker>,
  ) {}

  async findAll({ organization_id }: IFindAll) {
    return this.repository.find({ where: { organization_id }, order: { start: 'ASC' } });
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
      'tracker.id',
      'tracker.start',
      'tracker.end',
      'tracker.assignment_id',
      'tracker.reason',
      'tracker.created_at',
      'tracker.updated_at',
      'assignment.status',
      'collaborator.id',
      'collaborator.name',
    ];

    const query = this.repository
      .createQueryBuilder('tracker')
      .leftJoin('tracker.collaborator', 'collaborator')
      .where({ organization_id })
      .select(fields)
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    getParentPathQuery({ entityType: 'tracker', query, getCustomer: true });

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findAllPersonal({
    organization_id,
    collaborator_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindAllPersonal) {
    const fields = [
      'tracker.id',
      'tracker.start',
      'tracker.end',
      'tracker.assignment_id',
      'tracker.reason',
      'tracker.created_at',
      'tracker.updated_at',
      'assignment.status',
    ];

    const query = this.repository
      .createQueryBuilder('tracker')
      .where({ organization_id, collaborator_id })
      .select(fields)
      .take(paginationSize)
      .skip((page - 1) * paginationSize);

    getParentPathQuery({ entityType: 'tracker', query, getCustomer: true });

    configSortRepository({ sortConfig: sort_by, order: order_by, query });

    configFiltersQuery({
      query,
      filters,
      customFilters,
    });

    return query.getManyAndCount();
  }

  async findAllDataLoader(ids: string[], key: string) {
    return this.repository.find({
      where: { [key]: In(ids) },
      order: { start: 'ASC' },
    });
  }

  async findAllLooseDataLoader(ids: string[]) {
    return this.repository.find({
      where: { collaborator_id: In(ids), assignment_id: IsNull() },
      order: { start: 'ASC' },
    });
  }

  async findAllByAssignment(assignment_id: string) {
    return this.repository.find({ where: { assignment_id } });
  }

  async findAllByManyAssignments(assignments_id: string[]) {
    return this.repository.find({
      order: { start: 'ASC' },
      where: { assignment_id: In(assignments_id) },
    });
  }

  async findAllByCollaborator(collaborator_id: string, assignmentStatus?: string) {
    if (assignmentStatus) {
      const trackersAssignments = await this.repository
        .createQueryBuilder('t')
        .innerJoinAndSelect('t.assignment', 'assignment')
        .where('assignment.status = :status', { status: assignmentStatus })
        .getMany();

      const trackersReason = await this.repository.find({
        where: { collaborator_id, assignment_id: IsNull() },
      });

      return [...trackersAssignments, ...trackersReason];
    }

    return this.repository.find({ where: { collaborator_id } });
  }

  async findAllLooseByCollaborator(collaborator_id: string) {
    return this.repository.find({ where: { collaborator_id, assignment_id: IsNull() } });
  }

  async findAllByDateCollaborator(collaborator_id: string, date: Date) {
    const startDay = setHours(setMinutes(setSeconds(date, 1), 0), 0); // Setando o horario para 00:00:01 (21h do dia anterior UTC+3)
    const endDay = setHours(setMinutes(setSeconds(date, 23), 59), 59); // Setando o horario para 23:59:59 (21h de hoje UTC+3)

    return this.repository.find({
      where: {
        collaborator_id,
        start: Between(startDay, endDay),
      },
    });
  }

  async findAllByDate({ date, organization_id }: IFindAllByDate) {
    const startDay = setHours(setMinutes(setSeconds(date, 1), 0), 0); // Setando o horario para 00:00:01
    const endDay = setHours(setMinutes(setSeconds(date, 23), 59), 59); // Setando o horario para 23:59:59

    return this.repository.find({
      where: {
        start: Between(startDay, endDay),
        organization_id,
      },
    });
  }

  async findAllCollaboratorLastHours(collaborator_id: string) {
    const dateCompare = subHours(new Date(), 24);

    return this.repository.find({
      where: {
        collaborator_id,
        start: MoreThanOrEqual(dateCompare),
        end: Not(IsNull()),
      },
    });
  }

  async findAllCollaboratorDateRelative({
    collaborator_id,
    date,
    hoursBefore,
  }: IfindAllCollaboratorDateRelativeParams) {
    const dateCompare = subHours(date, hoursBefore);

    return this.repository.find({
      where: [
        {
          collaborator_id,
          start: Between(dateCompare, date),
        },
        {
          collaborator_id,
          end: Between(dateCompare, date),
        },
      ],
    });
  }

  async findOnSamePeriod({ collaborator_id, end, start }: IFindOnSamePeriod) {
    const query = this.repository
      .createQueryBuilder('tracker')
      .where({ collaborator_id })
      .andWhere(
        new Brackets(q => {
          q.where(
            new Brackets(q2 => {
              q2.where('tracker.start <= :start', { start }).andWhere('tracker.end > :start', {
                start,
              });
            }),
          )
            .orWhere(
              new Brackets(q2 => {
                q2.where('tracker.start < :end', { end }).andWhere('tracker.end >= :end', {
                  end,
                });
              }),
            )
            .orWhere(
              new Brackets(q2 => {
                q2.where('tracker.start < :end', { end }).andWhere('tracker.start >= :start', {
                  start,
                });
              }),
            )
            .orWhere(
              new Brackets(q2 => {
                q2.where('tracker.end <= :end', { end }).andWhere('tracker.end > :start', {
                  start,
                });
              }),
            );
        }),
      );

    return query.getOne();
  }

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async getInfo(id: string) {
    const query = this.repository
      .createQueryBuilder('tracker')
      .leftJoin('tracker.collaborator', 'collaborator')
      .where({ id })
      .select(['tracker', 'collaborator.id', 'collaborator.name']);

    getParentPathQuery({ entityType: 'tracker', query, getCustomer: true });

    return query.getOne();
  }

  async findOpen(collaborator_id: string) {
    return this.repository.findOne({
      where: {
        collaborator_id,
        end: IsNull(),
      },
    });
  }

  async findActive(collaborator_id: string) {
    const query = this.repository
      .createQueryBuilder('tracker')
      .leftJoin('tracker.assignment', 'assignment')
      .leftJoin('assignment.trackers', 'trackers')
      .where({ end: IsNull(), collaborator_id })
      .select([
        'assignment.id',
        'assignment.timeLimit',
        'task.availableDate',
        'task.deadline',
        'task.description',
        'task.link',
        'tracker.id',
        'tracker.reason',
        'tracker.start',
        'tracker.end',
        'trackers.id',
        'trackers.start',
        'trackers.end',
      ]);

    getParentPathQuery({ entityType: 'assignment', query, getCustomer: true });

    return query.getOne();
  }

  async findManyOpen(assignments_id: string[]) {
    return this.repository.find({
      where: {
        assignment_id: In(assignments_id),
        end: IsNull(),
      },
    });
  }

  async create(data: ICreateTrackerRepositoryDto) {
    const tracker = this.repository.create(data);

    await this.repository.save(tracker);

    return tracker;
  }

  async save(tracker: Tracker) {
    return this.repository.save(tracker);
  }

  async saveManny(trackers: Tracker[]) {
    return this.repository.save(trackers);
  }

  async delete(tracker: Tracker) {
    await this.repository.remove(tracker);

    return tracker;
  }

  async deleteMany(trackers: Tracker[]) {
    await this.repository.remove(trackers);

    return trackers;
  }
}
