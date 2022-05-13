import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { ValueChain } from '../entities/ValueChain';
import { valueChainErrors } from '../errors/valueChain.errors';
import { ValueChainsRepository } from '../repositories/valueChains.repository';

type IValidateName = { name: string; product_id: string };

type IGetValueChain = {
  id: string;
  organization_id: string;
  relations?: string[];
  withTracker?: boolean;
};

type IValidateValueChain = { valueChain: ValueChain; organization_id: string };

@Injectable()
export class CommonValueChainService {
  constructor(private valueChainsRepository: ValueChainsRepository) {}

  async validateName({ name, product_id }: IValidateName): Promise<void> {
    const valueChain = await this.valueChainsRepository.findByName({
      name: name.trim(),
      product_id,
    });

    if (valueChain) {
      throw new AppError(valueChainErrors.duplicateName);
    }
  }

  validateValueChain({ valueChain, organization_id }: IValidateValueChain) {
    if (!valueChain) {
      throw new AppError(valueChainErrors.notFound);
    }

    validateOrganization({ entity: valueChain, organization_id });
  }

  async getValueChain({
    id,
    organization_id,
    relations,
    withTracker,
  }: IGetValueChain): Promise<ValueChain> {
    const valueChain = withTracker
      ? await this.valueChainsRepository.findByIdWithTrackers(id)
      : await this.valueChainsRepository.findById(id, relations);

    this.validateValueChain({ valueChain, organization_id });

    return valueChain;
  }
}
