import { Injectable } from '@nestjs/common';

import { FindOneProductService } from '@modules/products/services/findOne.product.service';
import { FixDatesProductService } from '@modules/products/services/fixDates.product.service';

import { ValueChainDto } from '../dtos/create.valueChain.dto';
import { ICreateValueChainRepository } from '../dtos/create.valueChain.repository.dto';
import { ValueChain } from '../entities/ValueChain';
import { ValueChainsRepository } from '../repositories/valueChains.repository';
import { CommonValueChainService } from './common.valueChain.service';

type ICreateValueChainService = ValueChainDto & { organization_id: string };

@Injectable()
export class CreateValueChainService {
  constructor(
    private valueChainsRepository: ValueChainsRepository,
    private commonValueChainService: CommonValueChainService,

    private findOneProductService: FindOneProductService,
    private fixDatesProductService: FixDatesProductService,
  ) {}

  async execute({
    name,
    product_id,
    organization_id,
  }: ICreateValueChainService): Promise<ValueChain> {
    const newValueChain: ICreateValueChainRepository = {
      organization_id,
    } as ICreateValueChainRepository;

    // Validando e Atribuindo o produto
    newValueChain.product = await this.findOneProductService.execute({
      id: product_id,
      organization_id,
    });

    // Validando e atribuindo o nome
    await this.commonValueChainService.validateName({ name, product_id });

    newValueChain.name = name.trim();

    // Salvando no banco de dados
    const valueChain = await this.valueChainsRepository.create(newValueChain);

    // Corrigindo as datas do produto pai (a data de fim pode ficar invalida)
    await this.fixDatesProductService.verifyDatesChanges({
      product_id: valueChain.product_id,
      end: { new: null },
    });

    return valueChain;
  }
}
