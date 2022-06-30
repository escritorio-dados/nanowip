import * as yup from 'yup';

export type ISectionTrailSchema = { name: string };

export const sectionTrailSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
