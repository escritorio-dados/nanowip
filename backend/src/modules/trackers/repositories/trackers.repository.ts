import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { subHours } from 'date-fns';
import { Between, In, IsNull, Repository, Brackets } from 'typeorm';

import { IFindPagination, paginationSize } from '@shared/types/pagination';
import { configFiltersQuery } from '@shared/utils/filter/configFiltersRepository';
import { configSortRepository } from '@shared/utils/filter/configSortRepository';
import { getParentPathQuery } from '@shared/utils/getParentPath';

import { Tracker } from '../entities/Tracker';
import { ICreateTrackerRepository } from './types';

type IfindAllCollaboratorDateRelativeParams = {
  collaborator_id: string;
  date: Date;
  hoursBefore?: number;
};

type IFindAllPersonal = IFindPagination & { collaborator_id: string };

type IFindOnSamePeriod = { collaborator_id: string; start: Date; end: Date };

@Injectable()
export class TrackersRepository {
  constructor(
    @InjectRepository(Tracker)
    private repository: Repository<Tracker>,
  ) {}

  async findAllPagination({
    organization_id,
    sort_by,
    order_by,
    page,
    filters,
    customFilters,
  }: IFindPagination) {
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

  async findAllByManyAssignments(assignments_id: string[], organization_id: string) {
    return this.repository.find({
      order: { start: 'ASC' },
      where: { assignment_id: In(assignments_id), organization_id },
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

  async create(data: ICreateTrackerRepository) {
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
  }

  async deleteMany(trackers: Tracker[]) {
    await this.repository.remove(trackers);
  }
}
