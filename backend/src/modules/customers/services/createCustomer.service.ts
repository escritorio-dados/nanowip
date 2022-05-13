import { Injectable } from '@nestjs/common';

import { CustomerDto } from '../dtos/customer.dto';
import { Customer } from '../entities/Customer';
import { CustomersRepository } from '../repositories/customers.repository';
import { CommonCustomerService } from './commonCustomer.service';

type ICreateCustomerService = CustomerDto & { organization_id: string };

@Injectable()
export class CreateCustomerService {
  constructor(
    private customersRepository: CustomersRepository,
    private commonCustomerService: CommonCustomerService,
  ) {}

  async execute({ name, organization_id }: ICreateCustomerService): Promise<Customer> {
    await this.commonCustomerService.validadeName({ name, organization_id });

    const customer = await this.customersRepository.create({
      name: name.trim(),
      organization_id,
    });

    return customer;
  }
}
