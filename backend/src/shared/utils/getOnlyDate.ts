import { format } from 'date-fns';
import { convertToTimeZone } from 'date-fns-timezone';

export function getOnlyDateString(date: Date): string {
  const dateInSP = convertToTimeZone(date, { timeZone: 'America/Sao_Paulo' });

  return format(dateInSP, 'dd/MM/yyyy');
}
