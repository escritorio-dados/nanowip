import { Injectable } from '@nestjs/common';

import { DatesController } from '@shared/utils/ServiceDatesController';

import { FindOneProductService } from '@modules/products/products/services/findOne.product.service';
import { FixDatesProductService } from '@modules/products/products/services/fixDates.product.service';
import { UpdateTaskService } from '@modules/tasks/tasks/services/update.task.service';
import { ValueChainsRepository } from '@modules/valueChains/repositories/valueChains.repository';

import { ValueChainDto } from '../dtos/create.valueChain.dto';
import { CommonValueChainService } from './common.valueChain.service';

type IUpdateValueChainService = ValueChainDto & { id: string; organization_id: string };

@Injectable()
export class UpdateValueChainService {
  constructor(
    private valueChainsRepository: ValueChainsRepository,
    private commonValueChainService: CommonValueChainService,

    private findOneProductService: FindOneProductService,
    private fixDatesProductService: FixDatesProductService,
    private updateTaskService: UpdateTaskService,
  ) {}

  async execute({ id, name, product_id, organization_id }: IUpdateValueChainService) {
    const valueChain = await this.commonValueChainService.getValueChain({
      id,
      organization_id,
    });

    const datesController = new DatesController({ parent_id: valueChain.product_id });

    // Validando o produto
    if (product_id !== valueChain.product_id) {
      await this.commonValueChainService.validateName({ name, product_id });

      valueChain.product = await this.findOneProductService.execute({
        id: product_id,
        organization_id: valueChain.organization_id,
      });

      valueChain.product_id = product_id;
    }

    // Validando e atribuindo nome
    if (valueChain.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonValueChainService.validateName({ name, product_id });
    }

    valueChain.name = name.trim();

    // Salvando alterações
    await this.valueChainsRepository.save(valueChain);

    datesController.updateDates({ parent_id: valueChain.product_id });

    // Removendo dependicas externas nas tarefas
    if (datesController.changed('parent')) {
      await this.updateTaskService.removeExternalDependencies({
        value_chain_id: valueChain.id,
        organization_id: valueChain.organization_id,
      });

      await this.fixDatesProductService.recalculateDates(valueChain.product_id, 'full');

      await this.fixDatesProductService.recalculateDates(
        datesController.getParentId('old'),
        'full',
      );
    }

    return valueChain;
  }
}
