import * as yup from 'yup';

export type IDeliverableTagSchema = {
  name: string;
  description?: string;
  progress: string;
  goal: string;
  deadline?: Date;
};

const validateIntNumbers = (value: string) => /^([0-9]*)$/g.test(value);

export const deliverableTagSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  progress: yup
    .string()
    .test({
      test: (value, context) => {
        if (!value) {
          return true;
        }

        const isNumber = validateIntNumbers(value);

        if (!isNumber) {
          return context.createError({ message: 'Deve ser um numero inteiro', path: 'progress' });
        }

        if (Number(value) < 0) {
          return context.createError({
            message: 'Deve ser maior ou igual a zero',
            path: 'progress',
          });
        }

        return true;
      },
    })
    .transform((value) => value.replace(',', '.')),
  goal: yup
    .string()
    .test({
      test: (value, context) => {
        if (!value) {
          return true;
        }

        const isNumber = validateIntNumbers(value);

        if (!isNumber) {
          return context.createError({ message: 'Deve ser um numero inteiro', path: 'goal' });
        }

        if (Number(value) <= 0) {
          return context.createError({ message: 'Deve ser maior que zero', path: 'goal' });
        }

        return true;
      },
    })
    .transform((value) => value.replace(',', '.')),
});
