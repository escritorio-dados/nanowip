import * as yup from 'yup';

import { datesSchema } from '#shared/utils/datesSchame';

type IOption = { id: string; name: string };

export type ITaskNoDependenciesSchema = {
  name: string;
  description: string;
  link: string;
  taskType: IOption;
  deadline: Date | null;
  availableDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  tags?: string[];
};

export const taskNoDependenciesSchema = yup
  .object()
  .shape({
    name: yup.string().required('O nome é obrigatório'),
    link: yup.string().optional().url(),
    taskType: yup.object().nullable().required('O tipo de produto é obrigatório'),
  })
  .concat(datesSchema);
