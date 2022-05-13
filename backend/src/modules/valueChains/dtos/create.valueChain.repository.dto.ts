import { Product } from '@modules/products/entities/Product';

export type ICreateValueChainRepository = {
  name: string;
  product: Product;
  organization_id: string;
};
