import { Injectable } from '@nestjs/common';

import { CustomerDto } from '../dtos/customer.dto';
import { Customer } from '../entities/Customer';
import { CustomersRepository } from '../repositories/customers.repository';
import { CommonCustomerService } from './commonCustomer.service';

type IUpdateCustomerService = CustomerDto & { id: string; organization_id: string };

@Injectable()
export class UpdateCustomerService {
  constructor(
    private customersRepository: CustomersRepository,
    private commonCustomerService: CommonCustomerService,
  ) {}

  async execute({ id, name, organization_id }: IUpdateCustomerService): Promise<Customer> {
    const customer = await this.commonCustomerService.getCustomer({ id, organization_id });

    if (customer.name.toLowerCase() !== name.trim().toLowerCase()) {
      await this.commonCustomerService.validadeName({ name, organization_id });
    }

    customer.name = name.trim();

    await this.customersRepository.save(customer);

    return customer;
  }
}
