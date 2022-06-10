import { ICommonApi } from '#shared/types/ICommonApi';

import { ICost } from '#modules/costs/costs/types/ICost';
import { IProduct } from '#modules/products/products/types/IProduct';
import { ITaskType } from '#modules/tasks/taskTypes/types/ITaskType';

export type ICostDistribution = ICommonApi & {
  product: IProduct;
  taskType?: ITaskType;
  percent: number;
  cost: ICost;
  value: number;
};

export type ICreateCostDistribution = {
  cost_id: string;
  product_id: string;
  task_type_id?: string;
  percent: number;
};

export type IUpdateCostDistribution = {
  product_id: string;
  task_type_id?: string;
  percent: number;
};
