export const taskErrors = {
  duplicateName: {
    message: 'This name is already being used by another task',
    userMessage: 'Este nome já está sendo utilizado por outra tarefa',
  },
  notFound: {
    message: 'task not found',
    userMessage: 'tarefa não encontrada',
  },
  deleteWithAssignments: {
    message: 'tasks with assignments cannot be deleted',
    userMessage: 'tarefas com atribuições não pode ser excluida',
  },
  deleteWithCosts: {
    message: 'tasks with costs cannot be deleted',
    userMessage: 'tarefas com custos não pode ser excluida',
  },
  taskBeforeNotFound: {
    message: 'Previous task not found',
    userMessage: 'Tarefa anterior não encontrada',
  },
  previousTasksNotCompleted: {
    message: 'A task cannot be available before the previous tasks are completed',
    userMessage: 'Uma tarefa não pode estar disponivel antes que as tarefas anterior terminem',
  },
  nextTasksAlreadyStarted: {
    message: 'A task cannot end after the next tasks started',
    userMessage: 'Uma tarefa não pode ser finalizada depois que as proximas tarefas iniciem',
  },
  createInLockValueChain: {
    message: 'A task cannot be created in a value chain where its dependents already started',
    userMessage:
      'Uma tarefa não pode ser criada em uma cadeia de valor onde seus dependentes já iniciaram',
  },
  deleteInLockValueChain: {
    message: 'A task cannot be deleted of a value chain where its dependents already started',
    userMessage:
      'Uma tarefa não pode ser excluida de uma cadeia de valor onde seus dependentes já iniciaram',
  },
  previousValueChainNotCompleted: {
    message: 'A task cannot be available before the previous values chain is completed',
    userMessage:
      'Uma tarefa não pode estar disponivel antes que a cadeia de valor anterior termine',
  },
  removeAvailableDateFromTaskInProgress: {
    message: "it's not possible to remove the available date of a task that already started",
    userMessage: 'Não é possivel remover a data de disponibilidade de uma tarefa que já iniciou',
  },
  circularDependency: {
    message: 'there can be no circular dependence between tasks',
    userMessage: 'Não pode existir dependencia circular entre tarefas',
  },
  changeEndWhereTaskDepedentsStarted: {
    message:
      'it is not possible to change the end date of a task where this dependents already started',
    userMessage:
      'Não é possivel alterar a data de término de uma tarefa onde seus dependentes já iniciaram',
  },
  changeEndWhereValueChainDepedentsStarted: {
    message:
      'it is not possible to change the end date of a task where the value chains dependents already started',
    userMessage:
      'Não é possivel alterar a data de término de uma tarefa onde as cadeias de valores dependentes já iniciaram',
  },
};
