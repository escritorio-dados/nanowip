import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { customersErrors } from '../errors/customers.errors';
import { CustomersRepository } from '../repositories/customers.repository';
import { CommonCustomerService } from './commonCustomer.service';

type IDeleteCustomerService = { id: string; organization_id: string };

@Injectable()
export class DeleteCustomerService {
  constructor(
    private customersRepository: CustomersRepository,
    private commonCustomerService: CommonCustomerService,
  ) {}

  async execute({ id, organization_id }: IDeleteCustomerService) {
    const customer = await this.commonCustomerService.getCustomer({
      id,
      relations: ['projects'],
      organization_id,
    });

    if (customer.projects.length > 0) {
      throw new AppError(customersErrors.customerWithProject);
    }

    await this.customersRepository.delete(customer);
  }
}
