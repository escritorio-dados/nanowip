import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { DeleteTaskTrailService } from '@modules/trails/taskTrails/services/delete.taskTrail.service';
import { TrailsRepository } from '@modules/trails/trails/repositories/trails.repository';

import { CommonTrailService } from './common.trail.service';

type IDeleteTrailService = { id: string; organization_id: string };

@Injectable()
export class DeleteTrailService {
  constructor(
    @InjectConnection() private connection: Connection,

    private trailsRepository: TrailsRepository,
    private commonTrailService: CommonTrailService,

    private deleteTaskTrailService: DeleteTaskTrailService,
  ) {}

  async execute({ id, organization_id }: IDeleteTrailService) {
    const trail = await this.commonTrailService.getTrail({
      id,
      organization_id,
      relations: ['tasks'],
    });

    // Deletar todas as tags associadas a esta trilha
    const ids = trail.tasks.map(task => task.id);

    await this.connection.transaction(async manager => {
      await this.deleteTaskTrailService.deleteMany({ ids, organization_id }, manager);

      await this.trailsRepository.delete(trail, manager);
    });
  }
}
