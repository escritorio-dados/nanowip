import { blue, green, red } from '@mui/material/colors';

import { getSortOptions } from '#shared/utils/pagination';

export const StatusDate = {
  created: 'Criado',
  available: 'Disponivel',
  started: 'Em Andamento',
  ended: 'Finalizado',
};

export const StatusDateColor = {
  [StatusDate.created]: '#00000000',
  [StatusDate.available]: '#fff',
  [StatusDate.started]: blue[600],
  [StatusDate.ended]: green[500],
  late: red[500],
};

type IStatusDateTranslator = { [key: string]: string };

export const statusDateTranslator: IStatusDateTranslator = {
  ...StatusDate,
  late: 'Atrasado',
};

export const statusDateOptions = getSortOptions(statusDateTranslator);

export const statusDateNoLateOptions = getSortOptions(StatusDate);

export type IStatusDate = {
  status: string;
  late: boolean;
};
