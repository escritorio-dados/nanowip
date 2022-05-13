enum CaslActions {
  manage = 'manage', // Permite todos os outros
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
  personal = 'personal', // Indicando que a pessoa só pode acessar as proprias informações
}

export default CaslActions;
