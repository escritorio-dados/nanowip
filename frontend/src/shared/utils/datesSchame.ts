import { isAfter } from 'date-fns';
import * as yup from 'yup';

export const datesSchema = yup.object().shape({
  deadline: yup.date().nullable(),
  availableDate: yup
    .date()
    .nullable()
    .test({
      message: 'Data de disponibilidade não pode ser superior que a data atual',
      test: (availableDate: any) => {
        if (availableDate && isAfter(availableDate, new Date())) {
          return false;
        }

        return true;
      },
    }),
  startDate: yup
    .date()
    .nullable()
    .test({
      test: (startDate: any, context: yup.TestContext) => {
        const { availableDate } = context.parent;

        if (startDate === null) {
          return true;
        }

        if (isAfter(startDate, new Date())) {
          return context.createError({
            message: 'Data de inicio não pode ser superior que a data atual',
            path: 'startDate',
          });
        }

        if (!availableDate) {
          return context.createError({
            message: 'Data de disponibilidade é origatório quando há uma data de inicio',
            path: 'availableDate',
          });
        }

        return isAfter(startDate, availableDate);
      },
      message: 'A data de inicio deve ser maior que a data de disponibilidade',
    }),
  endDate: yup
    .date()
    .nullable()
    .test({
      test: (endDate: any, context: yup.TestContext) => {
        const { startDate } = context.parent;

        if (endDate === null) {
          return true;
        }

        if (isAfter(endDate, new Date())) {
          return context.createError({
            message: 'Data de término não pode ser superior que a data atual',
            path: 'endDate',
          });
        }

        if (!startDate) {
          return context.createError({
            message: 'Data de inicio é obrigatória quando há uma data de término',
            path: 'startDate',
          });
        }

        return isAfter(endDate, startDate);
      },
      message: 'A data de término deve ser maior que a data de incio',
    }),
});
