import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { getParentPathQuery } from '@shared/utils/getParentPath';

import { ICreateCostDistributionRepositoryDto } from '../dtos/create.costDistribution.repository.dto';
import { CostDistribution } from '../entities/CostDistribution';

type IFindAllByCostInfo = { cost_id: string; organization_id: string };

type IFindAllByKeys = {
  ids: string[];
  key: string;
  relations?: string[];
  organization_id: string;
};

@Injectable()
export class CostDistributionsRepository {
  constructor(
    @InjectRepository(CostDistribution)
    private repository: Repository<CostDistribution>,
  ) {}

  async getInfo(id: string) {
    const query = this.repository
      .createQueryBuilder('costDistribution')
      .leftJoin('costDistribution.product', 'product')
      .leftJoin('costDistribution.cost', 'cost')
      .leftJoin('costDistribution.service', 'service')
      .where({ id })
      .select([
        'costDistribution',
        'cost.reason',
        'cost.value',
        'service.id',
        'service.name',
        'product.id',
        'product.name',
      ]);

    getParentPathQuery({ entityType: 'product', query, getCustomer: true });

    return query.getOne();
  }

  async findAllByCostInfo({ organization_id, cost_id }: IFindAllByCostInfo) {
    const fields = [
      'costDistribution.id',
      'costDistribution.percent',
      'cost.value',
      'product.id',
      'product.name',
      'service.id',
      'service.name',
    ];

    const query = this.repository
      .createQueryBuilder('costDistribution')
      .leftJoin('costDistribution.service', 'service')
      .leftJoin('costDistribution.product', 'product')
      .leftJoin('costDistribution.cost', 'cost')
      .select(fields)
      .where({ organization_id, cost_id });

    getParentPathQuery({ entityType: 'product', query, getCustomer: true });

    return query.getMany();
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

  async create(data: ICreateCostDistributionRepositoryDto) {
    const costDistribution = this.repository.create(data);

    await this.repository.save(costDistribution);

    return costDistribution;
  }

  async save(costDistribution: CostDistribution) {
    return this.repository.save(costDistribution);
  }

  async saveAll(costDistributions: CostDistribution[]) {
    return this.repository.save(costDistributions);
  }

  async delete(costDistribution: CostDistribution) {
    await this.repository.remove(costDistribution);
  }

  async deleteMany(costDistributions: CostDistribution[]) {
    await this.repository.remove(costDistributions);
  }
}
