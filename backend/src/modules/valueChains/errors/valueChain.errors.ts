export const valueChainErrors = {
  duplicateName: {
    message: 'This name is already being used by another value chain',
    userMessage: 'Este nome já está sendo utilizado por outra cadeia de valor',
  },
  notFound: {
    message: 'value chain not found',
    userMessage: 'cadeia de valor não encontrada',
  },
  beforeNotFound: {
    message: 'value chain before not found',
    userMessage: 'cadeia de valor anterior não encontrada',
  },
  deleteWithTasks: {
    message: 'a value chain with tasks cannot be deleted',
    userMessage: 'uma cadeia de valor com tarefas não pode ser excluida',
  },
  deleteWithTrackers: {
    message: 'value chains with trackers cannot be deleted',
    userMessage: 'cadeias de valor com trackers registrados não podem ser excluida',
  },
  circularDependency: {
    message: 'there can be no circular dependence between value chains',
    userMessage: 'Não pode existir dependencia circular entre cadeias de valor',
  },
  beforeNotEnded: {
    message:
      "it's not possible for a value chain that has already started to depend on a value chain that has not ended",
    userMessage:
      'Não é possivel para que uma cadeia de valor que já tenha iniciado dependa de uma cadeia de valor que não finalizou',
  },
};
