import { ICommonApi } from '#shared/types/ICommonApi';
import { IDatesApi } from '#shared/types/IDatesApi';
import { IStatusDate } from '#shared/types/IStatusDate';

import { IMeasure } from '#modules/products/measures/types/IMeasure';
import { IProductType } from '#modules/products/productTypes/types/IProductType';
import { IProject } from '#modules/projects/projects/types/IProject';
import { IValueChain } from '#modules/valueChains/types/IValueChain';

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
  status_date: { value: string; label: string } | null;

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
  status_date: { value: string; label: string } | null;
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
