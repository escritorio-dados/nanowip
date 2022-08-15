import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Milestone } from '../entities/Milestone';
import { ICreateMilestoneReporitory } from './types';

type IFindById = { id: string; relations?: string[] };

type IFindAllByKey = { id: string; key: string; organization_id: string; relations?: string[] };

@Injectable()
export class MilestonesRepository {
  constructor(
    @InjectRepository(Milestone)
    private repository: Repository<Milestone>,
  ) {}

  async findById({ id, relations }: IFindById) {
    return this.repository.findOne(id, { relations });
  }

  async findAllByKey({ id, key, organization_id, relations }: IFindAllByKey) {
    return this.repository.find({
      where: { [key]: id, organization_id },
      relations,
      order: { date: 'ASC' },
    });
  }

  async create(data: ICreateMilestoneReporitory, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Milestone) : this.repository;

    const milestone = repo.create(data);

    await repo.save(milestone);

    return milestone;
  }

  async save(milestone: Milestone) {
    return this.repository.save(milestone);
  }

  async delete(milestone: Milestone) {
    await this.repository.remove(milestone);
  }
}
