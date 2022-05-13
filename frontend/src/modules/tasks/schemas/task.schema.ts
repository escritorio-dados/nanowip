import * as yup from 'yup';

import { datesSchema } from '#shared/utils/datesSchame';

type IOption = { id: string; name: string };

type IOptionPath = { id: string; pathString: string };

export type ITaskSchema = {
  name: string;
  description: string;
  link: string;
  taskType: IOption;
  nextTasks: IOptionPath[];
  previousTasks: IOptionPath[];
  deadline: Date | null;
  availableDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
};

export const taskSchema = yup
  .object()
  .shape({
    name: yup.string().required('O nome é obrigatório'),
    link: yup.string().optional().url(),
    taskType: yup.object().nullable().required('O tipo de produto é obrigatório'),
  })
  .concat(datesSchema);
