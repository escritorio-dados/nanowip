import { v4 as uuidV4 } from 'uuid';

import { Project } from '@modules/projects/entities/Project';

import { Customer } from '../entities/Customer';

type IFindByIdProps = { id: string; relations?: string[] };
type IFindByName = { name: string; organization_id: string };
type ICreateCustomer = { name: string; organization_id: string };

type ICustomersFake = { C1_O1: Customer; C2_O1_WP: Customer; C3_O2: Customer };

export const customersFake: ICustomersFake = {
  C1_O1: {
    id: 'e4f8c6de-7c4e-42c4-bf59-df0796928385',
    name: 'cliente_1',
    organization_id: 'organization_1',
    projects: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
  C2_O1_WP: {
    id: '42e77b0c-5974-4613-8321-fdfdfd9582fb',
    name: 'cliente_2',
    organization_id: 'organization_1',
    projects: [{ name: 'project_1' } as Project],
    created_at: new Date(),
    updated_at: new Date(),
  },
  C3_O2: {
    id: '4a911f09-671e-40f6-be7b-9042326afa2d',
    name: 'cliente_3',
    organization_id: 'organization_2',
    projects: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
};

export class CustomersFakeRepository {
  private repository = Object.values(customersFake);

  async findById({ id }: IFindByIdProps) {
    const customerFinded = this.repository.find(customer => customer.id === id);

    return customerFinded;
  }

  async findAll(organization_id: string) {
    return this.repository
      .filter(customer => customer.organization_id === organization_id)
      .sort((customerA, customerB) => customerA.name.localeCompare(customerB.name));
  }

  async findByName({ name, organization_id }: IFindByName): Promise<Customer | undefined> {
    return this.repository.find(
      customer =>
        customer.organization_id === organization_id &&
        customer.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async create(data: ICreateCustomer): Promise<Customer> {
    const newCustomer: Customer = {
      id: uuidV4(),
      ...data,
      projects: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.repository.push(newCustomer);

    return newCustomer;
  }

  async delete(customer: Customer): Promise<Customer> {
    this.repository = this.repository.filter(({ id }) => id !== customer.id);

    return customer;
  }

  async save(customer: Customer): Promise<Customer> {
    this.repository = this.repository.map(customerRepository => {
      if (customerRepository.id === customer.id) {
        customerRepository = { ...customer };
      }

      return customerRepository;
    });

    return customer;
  }
}
