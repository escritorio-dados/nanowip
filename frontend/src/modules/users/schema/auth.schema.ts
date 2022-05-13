import * as yup from 'yup';

export type IAuthSchema = {
  email: string;
  password: string;
  organization: { id: string; name: string };
};

export const authSchema = yup.object().shape({
  email: yup.string().email('E-mail inválido').required('O E-mail é obrigatório'),
  password: yup.string().required('A senha é obrigatória'),
});
