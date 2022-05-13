export class IStatusDate {
  status: StatusDate;

  late: boolean;
}

enum StatusDate {
  created = 'Criado',
  available = 'Disponivel',
  started = 'Em Andamento',
  ended = 'Finalizado',
}

export default StatusDate;
