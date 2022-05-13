import * as yup from 'yup';

import { validateNumbers } from '#shared/utils/validateNumbers';

export type IFilterProductSchema = {
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

export const filterProductSchema = yup.object({
  min_quantity: yup
    .string()
    .optional()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
  max_quantity: yup
    .string()
    .optional()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
});
