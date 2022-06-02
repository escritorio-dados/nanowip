export const projectErrors = {
  duplicateName: {
    message: 'This name is already being used by another project',
    userMessage: 'Este nome já está sendo utilizado por outro projeto',
  },
  notFound: {
    message: 'project not found',
    userMessage: 'projeto não encontrado',
  },
  parentNotFound: {
    message: 'project parent not found',
    userMessage: 'projeto pai não encontrado',
  },
  deleteWithSubprojects: {
    message: 'a project with subprojects cannot be deleted',
    userMessage: 'um projeto com subprojetos não pode ser excluido',
  },
  deleteWithProducts: {
    message: 'a project with products cannot be deleted',
    userMessage: 'um projeto com produtos não pode ser excluido',
  },
  subprojectsOfsubprojects: {
    message: 'It is not possible to create subproject of subprojects',
    userMessage: 'Não é possivel criar subprojetos de subprojetos',
  },
  projectWithSubprojectsToSubproject: {
    message: 'It is not possible to convert a project with subprojects to a subproject',
    userMessage: 'Não é possivel converter um projeto com subprojetos em um subprojeto',
  },
};
