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
  previousTasksNotCompleted: {
    message: 'A task cannot be available before the previous tasks are completed',
    userMessage: 'Uma tarefa não pode estar disponivel antes que as tarefas anterior terminem',
  },
  nextTasksAlreadyStarted: {
    message: 'A task cannot end after the next tasks started',
    userMessage: 'Uma tarefa não pode ser finalizada depois que as proximas tarefas iniciem',
  },
  circularDependency: {
    message: 'there can be no circular dependence between tasks',
    userMessage: 'Não pode existir dependencia circular entre tarefas',
  },
};
