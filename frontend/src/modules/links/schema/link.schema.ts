import * as yup from 'yup';

export type ILinkSchema = {
  title: string;
  url: string;
  description?: string;
  category?: string;
  owner?: string;
};

export const linkSchema = yup.object().shape({
  title: yup.string().required('O Titulo é obrigatório'),
  url: yup.string().url('Insira um HTML valido').required('O Link é obrigatório'),
});
