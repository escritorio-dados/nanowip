import * as yup from 'yup';

import { validateNumbers } from '#shared/utils/validateNumbers';

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
