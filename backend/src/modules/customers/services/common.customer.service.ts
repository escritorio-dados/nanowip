import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { Customer } from '../entities/Customer';
import { customersErrors } from '../errors/customers.errors';
import { CustomersRepository } from '../repositories/customers.repository';

type IGetCustomerProps = { id: string; relations?: string[]; organization_id: string };

type IValidateNameCustomer = { name: string; organization_id: string };

type IValidateCustomer = { customer: Customer; organization_id: string };

@Injectable()
export class CommonCustomerService {
  constructor(private customersRepository: CustomersRepository) {}

  async validadeName({ name, organization_id }: IValidateNameCustomer) {
    const customer = await this.customersRepository.findByName({
      name: name.trim(),
      organization_id,
    });

    if (customer) {
      throw new AppError(customersErrors.duplicateName);
    }
  }

  async getCustomer({ id, relations, organization_id }: IGetCustomerProps) {
    const customer = await this.customersRepository.findById({ id, relations });

    this.validateCustomer({ customer, organization_id });

    return customer;
  }

  validateCustomer({ customer, organization_id }: IValidateCustomer) {
    if (!customer) {
      throw new AppError(customersErrors.notFound);
    }

    validateOrganization({ entity: customer, organization_id });
  }
}
