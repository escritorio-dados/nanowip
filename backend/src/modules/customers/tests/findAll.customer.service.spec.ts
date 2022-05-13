import { Test } from '@nestjs/testing';

import {
  customersFake,
  CustomersFakeRepository,
} from '@modules/customers/repositories/customers.fake.repository';
import { CustomersRepository } from '@modules/customers/repositories/customers.repository';

import { FindAllCustomerService } from '../services/findAllCustomer.service';

describe('Customers', () => {
  describe('FindAllCustomerService', () => {
    let findAllCustomerService: FindAllCustomerService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [FindAllCustomerService, CustomersRepository],
      })
        .overrideProvider(CustomersRepository)
        .useClass(CustomersFakeRepository)
        .compile();

      findAllCustomerService = moduleRef.get<FindAllCustomerService>(FindAllCustomerService);
    });

    it('should be able to find all customer from a organization', async () => {
      const customers = await findAllCustomerService.execute(customersFake.C1_O1.organization_id);

      expect(customers).toEqual(
        expect.arrayContaining([customersFake.C1_O1, customersFake.C2_O1_WP]),
      );
    });

    it('should not be able to find customers from another organization', async () => {
      const customers = await findAllCustomerService.execute(customersFake.C3_O2.organization_id);

      expect(customers).not.toEqual(expect.arrayContaining([customersFake.C1_O1]));
      expect(customers).not.toEqual(expect.arrayContaining([customersFake.C2_O1_WP]));
    });
  });
});
