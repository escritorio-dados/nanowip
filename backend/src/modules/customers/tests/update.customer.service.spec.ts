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
import { UpdateCustomerService } from '../services/updateCustomer.service';

describe('Customers', () => {
  describe('UpdateCustomerService', () => {
    let updateCustomerService: UpdateCustomerService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [UpdateCustomerService, CommonCustomerService, CustomersRepository],
      })
        .overrideProvider(CustomersRepository)
        .useClass(CustomersFakeRepository)
        .compile();

      updateCustomerService = moduleRef.get<UpdateCustomerService>(UpdateCustomerService);
    });

    it('should be able to update a customer', async () => {
      const customer = await updateCustomerService.execute({
        id: customersFake.C1_O1.id,
        name: 'cliente_1 atualizado',
        organization_id: customersFake.C1_O1.organization_id,
      });

      expect(customer).toEqual(
        expect.objectContaining({ id: customersFake.C1_O1.id, name: 'cliente_1 atualizado' }),
      );
    });

    it('should not be able to update a customers that not exists', async () => {
      await expect(
        updateCustomerService.execute({
          id: 'Não Existe',
          organization_id: customersFake.C1_O1.organization_id,
          name: customersFake.C1_O1.name,
        }),
      ).rejects.toEqual(new AppError(customerErrors.notFound));
    });

    it('should not be able to update a customer from another organization', async () => {
      await expect(
        updateCustomerService.execute({
          id: customersFake.C1_O1.id,
          name: 'Novo Nome',
          organization_id: customersFake.C3_O2.organization_id,
        }),
      ).rejects.toEqual(new AppError(commonErrors.invalidOrganization));
    });

    it('should be able to change de case of the name', async () => {
      const customer = await updateCustomerService.execute({
        id: customersFake.C1_O1.id,
        name: customersFake.C1_O1.name.toUpperCase(),
        organization_id: customersFake.C1_O1.organization_id,
      });

      expect(customer).toEqual(
        expect.objectContaining({
          id: customersFake.C1_O1.id,
          name: customersFake.C1_O1.name.toUpperCase(),
        }),
      );
    });

    it('should not be able to change the name to a name already in use', async () => {
      await expect(
        updateCustomerService.execute({
          id: customersFake.C1_O1.id,
          name: customersFake.C2_O1_WP.name,
          organization_id: customersFake.C1_O1.organization_id,
        }),
      ).rejects.toEqual(new AppError(customerErrors.duplicateName));
    });

    it('should allow duplicate names in different organizatons', async () => {
      const customer = await updateCustomerService.execute({
        id: customersFake.C1_O1.id,
        name: customersFake.C3_O2.name,
        organization_id: customersFake.C1_O1.organization_id,
      });

      expect(customer).toEqual(
        expect.objectContaining({ id: customersFake.C1_O1.id, name: customersFake.C3_O2.name }),
      );
    });

    it('should remove any white spaces on the endings of the name', async () => {
      const customer = await updateCustomerService.execute({
        id: customersFake.C1_O1.id,
        name: '      Cliente      ',
        organization_id: customersFake.C1_O1.organization_id,
      });

      expect(customer.name).toBe('Cliente');
    });
  });
});
