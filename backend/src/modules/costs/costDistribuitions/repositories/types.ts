import { Cost } from '@modules/costs/costs/entities/Cost';
import { Product } from '@modules/products/products/entities/Product';
import { TaskType } from '@modules/tasks/taskTypes/entities/TaskType';

export type ICreateCostDistributionRepository = {
  taskType?: TaskType;
  product: Product;
  cost: Cost;
  percent: number;
  organization_id: string;
};
