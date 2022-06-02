import { Injectable } from '@nestjs/common';

import { CustomersRepository } from '../repositories/customers.repository';
import { CommonCustomerService } from './common.customer.service';

type IFindOneCustomerService = { id: string; organization_id: string };

@Injectable()
export class FindOneCustomerService {
  constructor(
    private commonCustomerService: CommonCustomerService,
    private customersRepository: CustomersRepository,
  ) {}

  async getInfo({ id, organization_id }: IFindOneCustomerService) {
    const customer = await this.customersRepository.findByIdWithProjects(id);

    this.commonCustomerService.validateCustomer({ customer, organization_id });

    return customer;
  }

  async execute({ id, organization_id }: IFindOneCustomerService) {
    return this.commonCustomerService.getCustomer({ id, organization_id });
  }
}
