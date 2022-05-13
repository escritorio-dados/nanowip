import { Test } from '@nestjs/testing';
import { validate as isUUID } from 'uuid';

import { AppError } from '@shared/errors/AppError';

import { customerErrors } from '@modules/customers/errors/customer.errors';
import {
  customersFake,
  CustomersFakeRepository,
} from '@modules/customers/repositories/customers.fake.repository';
import { CustomersRepository } from '@modules/customers/repositories/customers.repository';

import { CommonCustomerService } from '../services/commonCustomer.service';
import { CreateCustomerService } from '../services/createCustomer.service';

describe('Customers', () => {
  describe('CreateCustomerService', () => {
    let createCustomerService: CreateCustomerService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [CreateCustomerService, CommonCustomerService, CustomersRepository],
      })
        .overrideProvider(CustomersRepository)
        .useClass(CustomersFakeRepository)
        .compile();

      createCustomerService = moduleRef.get<CreateCustomerService>(CreateCustomerService);
    });

    it('should be able to create a customer', async () => {
      const customer = await createCustomerService.execute({
        name: 'Thiago Ferreira',
        organization_id: 'organization_1',
      });

      expect(isUUID(customer.id)).toBeTruthy();
    });

    it('should not be able to create a customer with same name (case insensitive)', async () => {
      await expect(
        createCustomerService.execute({
          name: customersFake.C1_O1.name.toUpperCase(),
          organization_id: customersFake.C1_O1.organization_id,
        }),
      ).rejects.toEqual(new AppError(customerErrors.duplicateName));
    });

    it('should remove any white spaces on the endings of the name', async () => {
      const customer = await createCustomerService.execute({
        name: 'Thiago Ferreira      ',
        organization_id: 'organization_1',
      });

      expect(customer.name).toBe('Thiago Ferreira');
    });

    it('should allow duplicate names in different organizatons', async () => {
      const customer = await createCustomerService.execute({
        name: customersFake.C1_O1.name, // Pegando o nome de um cliente da Organização 1
        organization_id: customersFake.C3_O2.organization_id, // Com a organização 2
      });

      expect(isUUID(customer.id)).toBeTruthy();
    });
  });
});
