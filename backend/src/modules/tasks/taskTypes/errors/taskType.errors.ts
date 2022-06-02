export const taskTypeErrors = {
  duplicateName: {
    message: 'This name is already being used by another task type',
    userMessage: 'Este nome já está sendo utilizado por outro tipo de tarefa',
  },
  notFound: {
    message: 'task type not found',
    userMessage: 'tipo de tarefa não encontrado',
  },
  deleteWithTasks: {
    message: 'task types that is used by tasks cannot be deleted',
    userMessage: 'Tipos de tarefas que são usados por tarefas não podem ser excluidos',
  },
  deleteWithTasksTrail: {
    message: 'task types that is used by tasks (trail) cannot be deleted',
    userMessage: 'Tipos de tarefas que são usados por tarefas (trilha) não podem ser excluidos',
  },
};
