export class IStatusDate {
  status: StatusDate;

  late: boolean;
}

export enum StatusDate {
  created = 'Criado',
  available = 'Disponivel',
  started = 'Em Andamento',
  ended = 'Finalizado',
}
