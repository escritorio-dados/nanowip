import * as yup from 'yup';

import { validateNumbers } from '#shared/utils/validateNumbers';

export type IFilterCostDistributionSchema = {
  reason: string;
  description: string;
  documentNumber: string;
  documentType: { id: string; name: string } | null;
  product: { id: string; pathString: string } | null;
  taskType: { id: string; name: string } | null;
  serviceProvider: { id: string; name: string } | null;
  status: { label: string; value: string } | null;
  min_value: string;
  max_value: string;
  min_percent: string;
  max_percent: string;
  min_due: Date | null;
  max_due: Date | null;
  min_issue: Date | null;
  max_issue: Date | null;
  min_payment: Date | null;
  max_payment: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterCostDistributionSchema = yup.object().shape({
  min_value: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
  max_value: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
  min_percent: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
  max_percent: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
});
