import * as yup from 'yup';

import { validateNumbers } from '#shared/utils/validateNumbers';

type IOption = { id: string; name: string };

export type ICostSchema = {
  reason: string;
  value: string;
  documentLink?: string;
  description?: string;
  issueDate?: Date;
  dueDate?: Date;
  paymentDate?: Date;
  documentType?: IOption;
  documentNumber?: string;
  serviceProvider?: IOption;
};

export const costSchema = yup.object().shape({
  reason: yup.string().required('O motivo é obriagatório'),
  documentLink: yup.string().optional().url(),
  value: yup
    .string()
    .required('O valor é obrigatório')
    .test({
      test: (value) => (value ? validateNumbers(value) : false),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
});
