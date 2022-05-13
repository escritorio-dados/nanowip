import * as yup from 'yup';

import { ITrasnlatedPermission } from '#shared/utils/translatePermissions';

export type ICreateUserSchema = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  permissions: ITrasnlatedPermission[];
};

export const createUserSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  email: yup.string().email('E-mail inválido').required('O e-mail é obrigatório'),
  password: yup.string().required('A senha é obrigatória'),
  confirmPassword: yup
    .string()
    .nullable(true)
    .test({
      test: (pass, ctx) => {
        return ctx.parent.password === pass;
      },
      message: 'As senhas não são iguais',
    }),
  permissions: yup
    .array()
    .min(1, 'As permissões é obrigatório')
    .of(
      yup.object().shape({
        permission: yup.string().required(),
        translate: yup.string().required(),
      }),
    ),
});
