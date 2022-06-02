export const userErrors = {
  anotherChangeRootInformation: {
    message: 'Only the root user can change their own information',
    userMessage: 'Somente o usuario raiz pode mudar suas informações',
  },
  changeSelfPermissions: {
    message: 'You cannot change your permissions',
    userMessage: 'Não é possivel alterar suas proprias permissões',
  },
  oldPasswordInvalid: {
    message: 'Old password invalid',
    userMessage: 'Senha Antiga Invalida',
  },
  duplicateEmail: {
    message: 'This email is already registered in this organization',
    userMessage: 'Este e-mail já está cadastrado nesta organização',
  },
  reservedEmailSystem: {
    message: 'Emails in the System organization must be unique across all organizations',
    userMessage: 'Emails na organização Sistema devem ser exclusivos entre todas as organizações',
  },
  reservedEmailOthers: {
    message: 'This is a reserved email and cannot be used',
    userMessage: 'Este é um e-mail reservado e não pode ser usado',
  },
  notFound: {
    message: 'User not found',
    userMessage: 'Usuario não encontrado',
  },
  cannotBeDeleted: {
    message: 'This user cannot be deleted',
    userMessage: 'Este usuario não pode ser excluido',
  },
  deleteWithCollaborator: {
    message: 'users associated with collaborators cannot be deleted',
    userMessage: 'usuarios associados a colaboradores não podem ser excluidos',
  },
};
