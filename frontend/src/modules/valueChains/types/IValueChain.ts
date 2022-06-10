import { ICommonApi } from '#shared/types/ICommonApi';
import { IStatusDate } from '#shared/types/IStatusDate';

import { IProduct } from '#modules/products/products/types/IProduct';
import { ITask } from '#modules/tasks/tasks/types/ITask';

export type IValueChain = ICommonApi & {
  name: string;
  availableDate: Date;
  startDate: Date;
  endDate: Date;
  product_id: string;
  product: IProduct;
  tasks: ITask[];
  statusDate: IStatusDate;
};

export type IValueChainFilters = {
  name: string;
  product: { id: string; pathString: string } | null;
  status_date: { value: string; label: string } | null;

  min_start: Date | null;
  max_start: Date | null;

  min_end: Date | null;
  max_end: Date | null;

  min_available: Date | null;
  max_available: Date | null;

  min_updated: Date | null;
  max_updated: Date | null;
};

export type IValueChainInput = { name: string; product_id: string };
