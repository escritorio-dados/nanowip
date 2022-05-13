export const collaboratorStatusErrors = {
  duplicateDate: {
    message: 'this month is already in use for this collaborator',
    userMessage: 'Esse mês já está sendo utilizado para este colaborador',
  },
  notFound: {
    message: 'collaborator status not found',
    userMessage: 'status colaborador não encontrado',
  },

  collaboratorRootUser: {
    message: 'root user cannot be used by a collaborator',
    userMessage: 'o usuario raiz não pode ser usado por um colaborador',
  },
  userUsebByAnotherCollaborator: {
    message: 'this user is already in use by another collaborator',
    userMessage: 'este usuario já está sendo utilizado por outro colaborador',
  },
  deleteWithAssignments: {
    message: 'collaborators with assignments cannot be deleted',
    userMessage: 'colaboradores com atribuições não podem ser deletados',
  },
  deleteWithTrackers: {
    message: 'collaborators with trackers cannot be deleted',
    userMessage: 'colaboradores com trackers não podem ser deletados',
  },
  personalAccessAnotherUser: {
    message: "it's not possible to access another user collaborator with a personal access",
    userMessage: 'não é possível acessar o colaborador de outro usuário com um acesso pessoal',
  },
};
