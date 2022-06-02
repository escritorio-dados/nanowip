export const trackerErrors = {
  notFound: {
    message: 'tracker not found',
    userMessage: 'tracker não encontrado',
  },
  personalAccessAnotherUser: {
    message: "it's not possible to access another user tracker with a personal access",
    userMessage: 'não é possível acessar o tracker de outro usuário com um acesso pessoal',
  },
  trackersOnSamePeriod: {
    message: 'there is a tracker on the same period',
    userMessage: 'Já existe um registro no tracker no mesmo periodo',
  },
  omitEndWithoutPersonal: {
    message: 'Only the collaborator can omit the end date',
    userMessage: 'Apenas o colaborador pode omitir a data de término',
  },
  timeLimit: {
    message: 'A tracker must have a duration of less than 12 hours',
    userMessage: 'Um tracker deve ter uma duração inferior a 12 horas',
  },
  omitEndInAClosedAssignment: {
    message: 'The assignment must be open if end date is omitted',
    userMessage: 'A Atribuição deve estar aberta se a data de término for omitida',
  },
  omitEndStartBeforeLastTracker: {
    message: 'the tracker must be the latest if the end date is omitted',
    userMessage: 'O tracker deve ser o mais recente se a data de término for omitida',
  },
  endDateInvalidCloseAssignments: {
    message: 'If the assignment is closed, the end date must be before the task end date',
    userMessage:
      'Se a tarefa estiver fechada, a data de término deve ser anterior à data de término da tarefa',
  },
  stopTrackerStoped: {
    message: 'A tracker cannot be finished if it already has an end date.',
    userMessage: 'Um tracker não pode ser finalizado se ele já possui uma data de fim',
  },
  startTrackerInAssignmentClosed: {
    message: 'A tracker cannot be started in a assignment closed',
    userMessage: 'Um tracker não pode ser iniciado em uma atribuição fechada',
  },
  differentCollaboratorsTrackerAssignment: {
    message: 'The collaborator in the assignment and in the tracker is different',
    userMessage: 'O colaborador na atribuição e no tracker é diferentes',
  },
  differentCollaboratorsTrackerUser: {
    message: 'The collaborator in the tracker and the logged in user is different',
    userMessage: 'O colaborador no tracker e no usuario logado é diferente',
    statusCode: 403,
  },
  taskNotAvailable: {
    message: 'The task is not available to start on the date entered',
    userMessage: 'A tarefa não está disponível para começar na data inserida',
  },
  closeTrackerAfterNewTracker: {
    message:
      'It is not possible to automatically end a tracker that has a start date later than the new tracker',
    userMessage:
      'Não é possivel finalizar automaticamente um tracker que tenha uma data de inicio posterior ao novo tracker',
  },
  deleteInCloseAssignment: {
    message: "It's not possible to delete a tracker from a closed assignment",
    userMessage: 'Não é possivel deletar um tracker de uma atribuição fechada',
  },
};
