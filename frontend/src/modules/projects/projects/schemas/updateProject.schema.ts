import * as yup from 'yup';

import { datesSchema } from '#shared/utils/datesSchame';

type IOption = { id: string; name: string };

export type IUpdateProjectSchema = {
  name: string;
  customer?: IOption;
  projectParent?: IOption;
  portfolios: IOption[];
  projectType: IOption;
  deadline?: Date | null;
  availableDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

export const updateProjectSchema = yup
  .object()
  .shape({
    name: yup.string().required('O nome é obrigatório'),
    customer: yup
      .object()
      .nullable()
      .test({
        test: (customer: any, context: yup.TestContext) => {
          const { projectParent } = context.parent;

          if (!customer && !projectParent) {
            return context.createError({
              message: 'O cliente ou o Projeto pai deve ser preenchido',
              path: 'customer',
            });
          }

          if (customer && projectParent) {
            return context.createError({
              message: 'Somente o cliente ou o Projeto pai deve ser preenchido (Não Ambos)',
              path: 'customer',
            });
          }

          return true;
        },
      }),
    projectType: yup.object().nullable().required('O tipo de projeto é obrigatório'),
  })
  .concat(datesSchema);
