import * as yup from 'yup';

export type ITrailSectionSchema = { name: string; tags: string[] };

export const trailSectionSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
