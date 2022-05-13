import * as yup from 'yup';

export type ITaskTypeSchema = { name: string };

export const taskTypeSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
