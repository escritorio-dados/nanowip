import { IStatusDate } from '#shared/types/IStatusDate';

export function getStatusText(statusDate: IStatusDate) {
  return statusDate.late ? `${statusDate.status} - Atrasado` : statusDate.status;
}
