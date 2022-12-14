import * as yup from 'yup';

export type IObjectiveSectionSchema = { name: string; tags: string[] };

export const objectiveSectionSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
