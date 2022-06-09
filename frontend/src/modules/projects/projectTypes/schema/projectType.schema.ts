import * as yup from 'yup';

export type IProjectTypeSchema = { name: string };

export const projectTypeSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
