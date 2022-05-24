import * as yup from 'yup';

export type IFilterProductReportSchema = {
  name: string;
  project: { id: string; pathString: string } | null;
  product_type: { id: string; name: string } | null;
  status_date: { value: string; label: string } | null;
  includeAvailable: boolean;
  includeFirst: boolean;
  includeLast: boolean;
};

export const filterProductReportSchema = yup.object({});
