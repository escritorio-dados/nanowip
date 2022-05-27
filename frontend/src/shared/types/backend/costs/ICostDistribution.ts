import { IProduct } from '../IProduct';
import { ITaskType } from '../ITaskType';
import { ICommonApi } from '../shared/ICommonApi';
import { ICost } from './ICost';

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
