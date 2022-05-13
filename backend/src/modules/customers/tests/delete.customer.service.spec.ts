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
import { DeleteCustomerService } from '../services/deleteCustomer.service';

describe('Customers', () => {
  describe('DeleteCustomerService', () => {
    let deleteCustomerService: DeleteCustomerService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [DeleteCustomerService, CommonCustomerService, CustomersRepository],
      })
        .overrideProvider(CustomersRepository)
        .useClass(CustomersFakeRepository)
        .compile();

      deleteCustomerService = moduleRef.get<DeleteCustomerService>(DeleteCustomerService);
    });

    it('should be able to delete a customer', async () => {
      const customer = await deleteCustomerService.execute({
        id: customersFake.C1_O1.id,
        organization_id: customersFake.C1_O1.organization_id,
      });

      expect(customer.id === customersFake.C1_O1.id).toBeTruthy();
    });

    it('should not be able to delete a customer with projects', async () => {
      await expect(
        deleteCustomerService.execute({
          id: customersFake.C2_O1_WP.id,
          organization_id: customersFake.C2_O1_WP.organization_id,
        }),
      ).rejects.toEqual(new AppError(customerErrors.customerWithProject));
    });

    it('should not be able to delete a customer from another organization', async () => {
      await expect(
        deleteCustomerService.execute({
          id: customersFake.C1_O1.id,
          organization_id: customersFake.C3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });
  });
});
