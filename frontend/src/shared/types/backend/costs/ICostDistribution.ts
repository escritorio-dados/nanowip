import { IProduct } from '../IProduct';
import { ICommonApi } from '../shared/ICommonApi';
import { ICost } from './ICost';
import { IService } from './IService';

export type ICostDistribution = ICommonApi & {
  product: IProduct;
  service?: IService;
  percent: number;
  cost: ICost;
  value: number;
};

export type ICreateCostDistribution = {
  cost_id: string;
  product_id: string;
  service_id?: string;
  percent: number;
};

export type IUpdateCostDistribution = { product_id: string; service_id?: string; percent: number };
