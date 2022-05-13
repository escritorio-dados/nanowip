import { Measure } from '@modules/measures/entities/Measure';
import { ProductType } from '@modules/productTypes/entities/ProductType';
import { Project } from '@modules/projects/entities/Project';

import { Product } from '../entities/Product';

export type ICreateProductRepositoryDto = {
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
