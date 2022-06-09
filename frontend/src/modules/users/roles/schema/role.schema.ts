import * as yup from 'yup';

import { ITrasnlatedPermission } from '#shared/utils/translatePermissions';

export type IRoleSchema = { name: string; permissions: ITrasnlatedPermission[] };

export const roleSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
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
