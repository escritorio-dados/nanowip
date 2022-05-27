import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { DeleteAssignmentService } from '@modules/assignments/services/delete.assignment.service';
import { FixDatesProductService } from '@modules/products/services/fixDates.product.service';
import { DeleteTaskService } from '@modules/tasks/tasks/services/delete.task.service';

import { valueChainErrors } from '../errors/valueChain.errors';
import { ValueChainsRepository } from '../repositories/valueChains.repository';
import { CommonValueChainService } from './common.valueChain.service';

type IDeleteValueChainService = { id: string; organization_id: string };

@Injectable()
export class DeleteValueChainService {
  constructor(
    private valueChainsRepository: ValueChainsRepository,
    private commonValueChainService: CommonValueChainService,

    private fixDatesProductService: FixDatesProductService,
    private deleteAssignmentService: DeleteAssignmentService,
    private deleteTaskService: DeleteTaskService,
  ) {}

  async execute({ id, organization_id }: IDeleteValueChainService) {
    const valueChain = await this.commonValueChainService.getValueChain({
      id,
      withTracker: true,
      organization_id,
    });

    // Coletando os ids abaixo
    const tasks_ids = valueChain.tasks.map(task => task.id);

    const assignments_ids = valueChain.tasks.flatMap(task => task.assignments.map(ac => ac.id));

    const trackers_ids = valueChain.tasks.flatMap(task =>
      task.assignments.flatMap(assign => assign.trackers.map(tracker => tracker.id)),
    );

    // Verificando se existe algum tracker registrado
    if (trackers_ids.length > 0) {
      throw new AppError(valueChainErrors.deleteWithTrackers);
    }

    // Verificando se existe algum data de termino nas tarefas
    const someEndTask = valueChain.tasks.some(task => !!task.endDate);

    if (someEndTask) {
      throw new AppError({
        message: 'value chains with tasks ended cannot be deleted',
        userMessage: 'Cadeias de valor com tarefas finalizadas não podem ser deletadas',
      });
    }

    // Deletar todos os assignemnts / Tasks
    await this.deleteAssignmentService.deleteMany({ ids: assignments_ids, organization_id });

    await this.deleteTaskService.deleteMany({ ids: tasks_ids, organization_id });

    await this.valueChainsRepository.delete(valueChain);

    await this.fixDatesProductService.recalculateDates(valueChain.product_id, 'full');
  }
}
