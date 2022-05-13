import * as yup from 'yup';

export type ITrailSchema = { name: string };

export const trailSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
