import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { TrailSection } from '../entities/TrailSection';
import { ICreateTrailSectionRepository } from './types';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string; section_trail_id: string };

type IFindAllByTrail = { section_trail_id: string; organization_id: string };

@Injectable()
export class TrailSectionsRepository {
  constructor(
    @InjectRepository(TrailSection)
    private repository: Repository<TrailSection>,
  ) {}

  async findAllByTrailInfo({ section_trail_id, organization_id }: IFindAllByTrail) {
    return this.repository
      .createQueryBuilder('trailSection')
      .where({ section_trail_id, organization_id })
      .select(['trailSection.id', 'trailSection.name', 'trailSection.position'])
      .orderBy('trailSection.position', 'ASC')
      .getMany();
  }

  async findAllByTrail({ section_trail_id, organization_id }: IFindAllByTrail) {
    return this.repository.find({
      where: { section_trail_id, organization_id },
      order: { position: 'ASC' },
    });
  }

  async findById({ id, relations }: IFindByIdProps) {
    return this.repository.findOne(id, { relations });
  }

  async findByName({ name, organization_id, section_trail_id }: IFindByName) {
    return this.repository.findOne({
      where: {
        name: Raw(alias => `${alias} ilike '${name}'`),
        organization_id,
        section_trail_id,
      },
    });
  }

  async getLastPosition(section_trail_id: string) {
    const { lastPosition }: { lastPosition: number } = await this.repository
      .createQueryBuilder('trailSection')
      .select('MAX(trailSection.position)', 'lastPosition')
      .where({ section_trail_id })
      .getRawOne();

    return lastPosition || 0;
  }

  async create(data: ICreateTrailSectionRepository) {
    const trailSection = this.repository.create(data);

    await this.repository.save(trailSection);

    return trailSection;
  }

  async delete(trailSection: TrailSection) {
    await this.repository.remove(trailSection);
  }

  async save(trailSection: TrailSection) {
    return this.repository.save(trailSection);
  }

  async saveMany(objectiveCategories: TrailSection[]) {
    return this.repository.save(objectiveCategories);
  }
}
