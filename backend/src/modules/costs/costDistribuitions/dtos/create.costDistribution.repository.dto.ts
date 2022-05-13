import { Cost } from '@modules/costs/costs/entities/Cost';
import { Service } from '@modules/costs/services/entities/Service';
import { Product } from '@modules/products/entities/Product';

export type ICreateCostDistributionRepositoryDto = {
  service?: Service;
  product: Product;
  cost: Cost;
  percent: number;
  organization_id: string;
};
