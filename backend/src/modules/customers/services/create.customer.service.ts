import { Injectable } from '@nestjs/common';

import { CustomerDto } from '../dtos/customer.dto';
import { CustomersRepository } from '../repositories/customers.repository';
import { CommonCustomerService } from './common.customer.service';

type ICreateCustomerService = CustomerDto & { organization_id: string };

@Injectable()
export class CreateCustomerService {
  constructor(
    private customersRepository: CustomersRepository,
    private commonCustomerService: CommonCustomerService,
  ) {}

  async execute({ name, organization_id }: ICreateCustomerService) {
    await this.commonCustomerService.validadeName({ name, organization_id });

    const customer = await this.customersRepository.create({
      name: name.trim(),
      organization_id,
    });

    return customer;
  }
}
