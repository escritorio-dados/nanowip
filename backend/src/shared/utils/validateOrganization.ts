import { AppError } from '@shared/errors/AppError';
import { commonErrors } from '@shared/errors/common.errors';

type IEntity = { [key: string]: any; organization_id: string };

type IValidateOrganization = { entity: IEntity; organization_id: string };

export function validateOrganization({ entity, organization_id }: IValidateOrganization) {
  if (entity.organization_id !== organization_id) {
    throw new AppError(commonErrors.invalidOrganization);
  }
}
