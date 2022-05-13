import * as yup from 'yup';

export type IOrganizationSchema = { name: string };

export const organizationSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
