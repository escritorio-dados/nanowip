import { Injectable } from '@nestjs/common';

import { getParentPath, getParentPathString } from '@shared/utils/getParentPath';
import { getStatusDate } from '@shared/utils/getStatusDate';

import { FindOneValueChainsQuery } from '../query/findOne.valueChains.query';
import { ValueChainsRepository } from '../repositories/valueChains.repository';
import { CommonValueChainService } from './common.valueChain.service';

type IFindOneValueChainService = FindOneValueChainsQuery & {
  id: string;
  organization_id: string;
  relations?: string[];
};

@Injectable()
export class FindOneValueChainService {
  constructor(
    private commonValueChainService: CommonValueChainService,
    private valueChainsRepository: ValueChainsRepository,
  ) {}

  async getInfo({ id, organization_id, max_path }: IFindOneValueChainService) {
    const valueChain = await this.valueChainsRepository.findByIdInfo(id);

    this.commonValueChainService.validateValueChain({ organization_id, valueChain });

    const configParentOption = {
      product: 'getProduct',
      project: 'getProject',
      customer: 'getCustomer',
    };

    const valueChainFormatted = {
      ...valueChain,
      statusDate: getStatusDate(valueChain),
      pathString: getParentPathString({
        entity: valueChain,
        [configParentOption[max_path]]: true,
        skipFirstName: true,
        entityType: 'valueChain',
      }),
      path: getParentPath({
        entity: valueChain,
        [configParentOption[max_path]]: true,
        entityType: 'valueChain',
      }),
    };

    return valueChainFormatted;
  }

  async execute({ id, organization_id, relations }: IFindOneValueChainService) {
    const valueChain = await this.commonValueChainService.getValueChain({
      id,
      relations,
      organization_id,
    });

    return valueChain;
  }
}
