export const organizationErrors = {
  duplicateName: {
    message: 'This name is already being used by another organization',
    userMessage: 'Este nome já está sendo utilizado por outra organização',
  },
  deleteRoot: {
    message: 'this organization cannot bet deleted',
    userMessage: 'esta organização não pode ser excluida',
  },
  notFound: {
    message: 'organization not found',
    userMessage: 'organização não encontrada',
  },
  organizationWithUsers: {
    message: 'organizations with users cannot be deleted',
    userMessage: 'organizações com usuarios não podem ser excluidas',
  },
  manipulateFromOutSystemOrg: {
    message: 'organizations can only be manipulated by users of the System organization',
    userMessage: 'organizações só podem ser manipuladas por usuários da organização Sistema',
    statusCode: 401,
  },
};
