import * as yup from 'yup';

type IOption = { id: string; name: string };

export type ITaskTrailSchema = {
  name: string;
  taskType: IOption;
  nextTasks: IOption[];
  previousTasks: IOption[];
};

export const taskTrailSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  taskType: yup.object().nullable().required('O tipo de tarefa é obrigatório'),
});
