import * as yup from 'yup';

import { datesSchema } from '#shared/utils/datesSchame';
import { validateNumbers } from '#shared/utils/validateNumbers';

type IOption = { id: string; name: string };

export type ICreateProductSchema = {
  name: string;
  project?: IOption;
  productParent?: IOption;
  productType: IOption;
  measure: IOption;
  quantity: string;
  deadline?: Date | null;
  availableDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

export type ICreateSubProductSchema = {
  name: string;
  measure: IOption;
  productType: IOption;
  deadline?: Date | null;
  availableDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

export const createProductSchema = yup
  .object()
  .shape({
    name: yup.string().required('O nome é obrigatório'),
    project: yup
      .object()
      .nullable()
      .test({
        test: (project: any, context: yup.TestContext) => {
          const { productParent } = context.parent;

          if (!project && !productParent) {
            return context.createError({
              message: 'O projeto ou o produto pai deve ser preenchido',
              path: 'project',
            });
          }

          if (project && productParent) {
            return context.createError({
              message: 'Somente o projeto ou o produto pai deve ser preenchido (Não Ambos)',
              path: 'project',
            });
          }

          return true;
        },
      }),
    productType: yup.object().nullable().required('O tipo de produto é obrigatório'),
    measure: yup.object().nullable().required('A unidade de medida é obrigatória'),
    quantity: yup
      .string()
      .required('A quantidade é obrigatória')
      .test({
        test: (value) => (value ? validateNumbers(value) : false),
        message: 'Deve ser um numero',
      })
      .transform((value) => value.replace(',', '.')),
  })
  .concat(datesSchema);

export const createSubProductSchema = yup
  .object()
  .shape({
    name: yup.string().required('O nome é obrigatório'),
    productType: yup.object().nullable().required('O tipo de produto é obrigatório'),
    measure: yup.object().nullable().required('A unidade de medida é obrigatória'),
    quantity: yup
      .string()
      .required('A quantidade é obrigatória')
      .test({
        test: (value) => (value ? validateNumbers(value) : false),
        message: 'Deve ser um numero',
      })
      .transform((value) => value.replace(',', '.')),
  })
  .concat(datesSchema);
