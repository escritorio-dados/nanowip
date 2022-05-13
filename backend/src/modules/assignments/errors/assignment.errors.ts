export const assignmentErrors = {
  duplicateAssignment: {
    message: 'This collaborator is already assigned to this task',
    userMessage: 'Este colaborador já está atribuido para esta tarefa',
  },
  notFound: {
    message: 'assignment not found',
    userMessage: 'atribuição não encontrada',
  },
  deleteWithTrackers: {
    message: 'a assignment with trackers cannot be deleted',
    userMessage: 'uma atribuição com trackers não pode ser excluida',
  },
  openAssignmentInCloseTask: {
    message: 'An assignment cannot be opened in a task that already ended',
    userMessage: 'Uma atribuição não pode ser aberta em uma tarefa que já terminou',
  },
  closeAssignmentWithoutTrackers: {
    message: "it's not possible to close an assignment without trackers",
    userMessage: 'Não é possivel fechar uma atribuição sem trackers',
  },
  closeAssignmentWithOpenTracker: {
    message:
      "it's not possible to close an assignment with a open tracker of more than 12 hours duration",
    userMessage:
      'Não é possivel fechar uma atribuição com um tracker aberto de mais de 12 horas de duração',
  },
  changeStatusAssignmentFromAnotherUser: {
    message: "it's not possible to change assignment status from another user",
    userMessage: 'Não é possivel alterar o status da atribuição de outro usuario',
  },
  personalAccessAnotherUser: {
    message: "it's not possible to access another user assignments with a personal access",
    userMessage: 'não é possível acessar as atribuições de outro usuário com um acesso pessoal',
  },
};
