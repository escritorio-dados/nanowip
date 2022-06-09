import * as yup from 'yup';

export type IChangePasswordSchema = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const changePasswordSchema = yup.object({
  oldPassword: yup.string().required('A senha atual é obrigatória'),
  newPassword: yup.string().required('A senha nova é obrigatória'),
  confirmPassword: yup.string().test({
    test: (pass, ctx) => {
      return ctx.parent.newPassword === pass;
    },
    message: 'As senhas não são iguais',
  }),
});
