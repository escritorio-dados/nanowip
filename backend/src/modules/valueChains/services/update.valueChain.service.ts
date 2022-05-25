import { Injectable } from '@nestjs/common';

import { ServiceDatesController } from '@shared/utils/ServiceDatesController';

import { FindOneProductService } from '@modules/products/services/findOne.product.service';
import { FixDatesProductService } from '@modules/products/services/fixDates.product.service';
import { UpdateTaskService } from '@modules/tasks/tasks/services/update.task.service';
import { ValueChainsRepository } from '@modules/valueChains/repositories/valueChains.repository';

import { ValueChainDto } from '../dtos/create.valueChain.dto';
import { ValueChain } from '../entities/ValueChain';
import { CommonValueChainService } from './common.valueChain.service';

type IUpdateValueChainService = ValueChainDto & { id: string; organization_id: string };

type IResolveParent = { product_id?: string; valueChain: ValueChain; name: string };

type IUpdateDatesParent = {
  valueChain: ValueChain;
  serviceDatesController: ServiceDatesController;
  old_product_id: string;
};

@Injectable()
export class UpdateValueChainService {
  constructor(
    private valueChainsRepository: ValueChainsRepository,
    private commonValueChainService: CommonValueChainService,

    private findOneProductService: FindOneProductService,
    private fixDatesProductService: FixDatesProductService,
    private updateTaskService: UpdateTaskService,
  ) {}

  private async updateDatesParent({
    old_product_id,
    valueChain,
    serviceDatesController,
  }: IUpdateDatesParent) {
    const changedParent = old_product_id !== valueChain.product_id;

    serviceDatesController.updateDates(valueChain, changedParent);

    if (serviceDatesController.needChangeDates()) {
      // Aplicando a mudança de datas caso seja necessario no local atual dela
      await this.fixDatesProductService.verifyDatesChanges({
        product_id: valueChain.product_id,
        ...serviceDatesController.getUpdateParams(),
      });

      // Se houve mudança de local, aplicando as mudanças no local antigo
      if (changedParent) {
        await this.fixDatesProductService.verifyDatesChanges({
          product_id: old_product_id,
          ...serviceDatesController.getUpdateParamsDelete(),
        });
      }
    }
  }

  private async resolveParent({ valueChain, product_id, name }: IResolveParent) {
    const changeParent = product_id !== valueChain.product_id;

    if (changeParent) {
      await this.commonValueChainService.validateName({ name, product_id });

      valueChain.product = await this.findOneProductService.execute({
        id: product_id,
        organization_id: valueChain.organization_id,
      });

      valueChain.product_id = product_id;

      return true;
    }

    return false;
  }

  async execute({
    id,
    name,
    product_id,
    organization_id,
  }: IUpdateValueChainService): Promise<ValueChain> {
    const valueChain = await this.commonValueChainService.getValueChain({
      id,
      organization_id,
    });

    // Validando o produto
    const old_product_id = valueChain.product_id;

    const changedParent = await this.resolveParent({ name, valueChain, product_id });

    // Validando e atribuindo nome
    if (valueChain.name.toLowerCase() !== name.toLowerCase()) {
      await this.commonValueChainService.validateName({ name, product_id });
    }

    valueChain.name = name.trim();

    // Salvando alterações
    await this.valueChainsRepository.save(valueChain);

    // Removendo dependicas externas nas tarefas
    if (changedParent) {
      await this.updateTaskService.removeExternalDependencies({
        value_chain_id: valueChain.id,
        organization_id: valueChain.organization_id,
      });
    }

    // Aplicando alterações de datas no Path acima
    const serviceDatesController = new ServiceDatesController(valueChain);

    await this.updateDatesParent({ valueChain, old_product_id, serviceDatesController });

    return valueChain;
  }
}
