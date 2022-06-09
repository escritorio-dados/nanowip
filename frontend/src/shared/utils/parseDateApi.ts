import { differenceInSeconds, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function parseDateApi(
  date: string | Date | null | undefined,
  dateFormat: string,
  empty?: string,
) {
  return date ? format(new Date(date), dateFormat, { locale: ptBR }) : empty || '-';
}

export function getDurationDates(start: string | Date, end?: string | Date) {
  const endDate = end ? new Date(end) : new Date();

  const prefix = end ? '' : '[P] ';

  const differenceSeconds = differenceInSeconds(endDate, new Date(start));

  return getDurationSeconds({ duration: differenceSeconds, prefix });
}

type IGetDurationDates = { duration: number; zeroString?: string; prefix?: string };

export function getDurationSeconds({ duration, prefix, zeroString }: IGetDurationDates) {
  if (duration === 0) {
    return zeroString || '00:00:00';
  }

  const hours = duration / 3600;

  const minutes = (hours - Math.floor(hours)) * 60;

  const seconds = (minutes - Math.floor(minutes)) * 60;

  const formatNumber = (number: number, sig = 2) => {
    const formato = '0'.repeat(sig);

    const numberString = String(Math.floor(number));

    return formato.substring(0, formato.length - numberString.length) + numberString;
  };

  return `${prefix || ''}${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
}
