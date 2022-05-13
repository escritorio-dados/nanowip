import * as yup from 'yup';

export type IDocumentTypeSchema = { name: string };

export const documentTypeSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
