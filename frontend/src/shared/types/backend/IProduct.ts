import { IStatusDate } from '../IStatusDate';
import { IMeasure } from './IMeasure';
import { IProductType } from './IProductType';
import { IProject } from './IProject';
import { IValueChain } from './IValueChain';
import { ICommonApi } from './shared/ICommonApi';
import { IDatesApi } from './shared/IDatesApi';

export type IProduct = ICommonApi &
  IDatesApi & {
    name: string;
    measure: IMeasure;
    quantity: number;
    productType: IProductType;
    project?: IProject;
    project_id?: string;
    productParent?: IProduct;
    product_parent_id?: string;
    subproducts: IProduct[];
    valueChains: IValueChain[];
    statusDate: IStatusDate;
  };

export type IProductFilters = {
  name: string;
  project: { id: string; pathString: string } | null;
  product_type: { id: string; name: string } | null;
  measure: { id: string; name: string } | null;
  status_date: string | null;

  min_quantity: string;
  max_quantity: string;

  min_start: Date | null;
  max_start: Date | null;

  min_end: Date | null;
  max_end: Date | null;

  min_available: Date | null;
  max_available: Date | null;

  min_deadline: Date | null;
  max_deadline: Date | null;

  min_updated: Date | null;
  max_updated: Date | null;
};

export type IProductReportFilters = {
  name: string;
  project: { id: string; pathString: string } | null;
  product_type: { id: string; name: string } | null;
  status_date: string | null;
  includeAvailable: boolean;
  includeFirst: boolean;
  includeLast: boolean;
};

export type IProductInput = {
  name: string;
  product_type_id: string;
  measure_id: string;
  product_parent_id?: string;
  project_id?: string;
  quantity: number;
  deadline?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  availableDate?: Date | null;
};

export const limitedProductLength = 100;
