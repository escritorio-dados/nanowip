import { Measure } from '@modules/products/measures/entities/Measure';
import { ProductType } from '@modules/products/productTypes/entities/ProductType';
import { Project } from '@modules/projects/projects/entities/Project';

import { Product } from '../entities/Product';

export type ICreateProductRepository = {
  name: string;
  quantity: number;
  productType: ProductType;
  measure: Measure;
  organization_id: string;
  productParent?: Product;
  project?: Project;
  deadline?: Date;
  availableDate?: Date;
  startDate?: Date;
  endDate?: Date;
};

export type IFindByNameProductRepository = {
  name: string;
  product_parent_id?: string;
  project_id?: string;
};
