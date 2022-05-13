import { Test } from '@nestjs/testing';

import { AppError } from '@shared/errors/AppError';
import { commonErrors } from '@shared/errors/common.errors';

import { customerErrors } from '@modules/customers/errors/customer.errors';
import {
  customersFake,
  CustomersFakeRepository,
} from '@modules/customers/repositories/customers.fake.repository';
import { CustomersRepository } from '@modules/customers/repositories/customers.repository';

import { CommonCustomerService } from '../services/commonCustomer.service';
import { FindOneCustomerService } from '../services/findOneCustomer.service';

describe('Customers', () => {
  describe('FindOneCustomerService', () => {
    let findOneCustomerService: FindOneCustomerService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [FindOneCustomerService, CommonCustomerService, CustomersRepository],
      })
        .overrideProvider(CustomersRepository)
        .useClass(CustomersFakeRepository)
        .compile();

      findOneCustomerService = moduleRef.get<FindOneCustomerService>(FindOneCustomerService);
    });

    it('should be able to find one customer', async () => {
      // Deletando o cliente
      const customer = await findOneCustomerService.execute({
        id: customersFake.C1_O1.id,
        organization_id: customersFake.C1_O1.organization_id,
      });

      expect(customer).toEqual(expect.objectContaining(customersFake.C1_O1));
    });

    it('should not be able to find a user that not exists', async () => {
      await expect(
        findOneCustomerService.execute({ id: 'Não Existe', organization_id: 'organização_1' }),
      ).rejects.toEqual(new AppError(customerErrors.notFound));
    });

    it('should not be able to return a customer from another organization', async () => {
      await expect(
        findOneCustomerService.execute({
          id: customersFake.C1_O1.id,
          organization_id: customersFake.C3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });
  });
});
