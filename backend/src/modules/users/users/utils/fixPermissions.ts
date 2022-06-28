import { PermissionsUser } from '../enums/permissionsUser.enum';

const ProjectRelationsPermissions = {
  [PermissionsUser.manage_project]: [
    [PermissionsUser.read_customer, PermissionsUser.manage_customer],
    [PermissionsUser.read_project_type, PermissionsUser.manage_project_type],
  ],
  [PermissionsUser.create_project]: [
    [PermissionsUser.read_customer, PermissionsUser.manage_customer],
    [PermissionsUser.read_project_type, PermissionsUser.manage_project_type],
    [PermissionsUser.read_portfolio, PermissionsUser.manage_portfolio],
  ],
  [PermissionsUser.update_project]: [
    [PermissionsUser.read_customer, PermissionsUser.manage_customer],
    [PermissionsUser.read_project_type, PermissionsUser.manage_project_type],
  ],
};

const ProductRelationsPermissions = {
  [PermissionsUser.manage_product]: [
    [PermissionsUser.read_project, PermissionsUser.manage_project],
    [PermissionsUser.read_product_type, PermissionsUser.manage_product_type],
    [PermissionsUser.read_measure, PermissionsUser.manage_measure],
  ],
  [PermissionsUser.create_product]: [
    [PermissionsUser.read_project, PermissionsUser.manage_project],
    [PermissionsUser.read_product_type, PermissionsUser.manage_product_type],
    [PermissionsUser.read_measure, PermissionsUser.manage_measure],
  ],
  [PermissionsUser.update_product]: [
    [PermissionsUser.read_project, PermissionsUser.manage_project],
    [PermissionsUser.read_product_type, PermissionsUser.manage_product_type],
    [PermissionsUser.read_measure, PermissionsUser.manage_measure],
  ],
};

const ValueChainRelationsPermissions = {
  [PermissionsUser.manage_value_chain]: [
    [PermissionsUser.read_product, PermissionsUser.manage_product],
  ],
  [PermissionsUser.create_value_chain]: [
    [PermissionsUser.read_product, PermissionsUser.manage_product],
  ],
};

const TaskRelationsPermissions = {
  [PermissionsUser.manage_task]: [
    [PermissionsUser.read_product, PermissionsUser.manage_product],
    [PermissionsUser.read_task_type, PermissionsUser.manage_task_type],
  ],
  [PermissionsUser.create_task]: [
    [PermissionsUser.read_product, PermissionsUser.manage_product],
    [PermissionsUser.read_task_type, PermissionsUser.manage_task_type],
  ],
  [PermissionsUser.update_task]: [
    [PermissionsUser.read_task_type, PermissionsUser.manage_task_type],
  ],
};

const AssignmentRelationsPermissions = {
  [PermissionsUser.manage_assignment]: [
    [PermissionsUser.read_collaborator, PermissionsUser.manage_collaborator],
    [PermissionsUser.read_task, PermissionsUser.manage_task],
  ],
  [PermissionsUser.create_assignment]: [
    [PermissionsUser.read_collaborator, PermissionsUser.manage_collaborator],
    [PermissionsUser.read_task, PermissionsUser.manage_task],
  ],
  [PermissionsUser.update_assignment]: [
    [PermissionsUser.read_collaborator, PermissionsUser.manage_collaborator],
  ],
};

const CollaboratorRelationsPermissions = {
  [PermissionsUser.manage_collaborator]: [[PermissionsUser.read_user, PermissionsUser.manage_user]],
  [PermissionsUser.create_collaborator]: [[PermissionsUser.read_user, PermissionsUser.manage_user]],
  [PermissionsUser.update_collaborator]: [[PermissionsUser.read_user, PermissionsUser.manage_user]],
};

const PersonalRelationsPermissions = {
  [PermissionsUser.personal_tracker]: [
    [PermissionsUser.personal_assignment],
    [PermissionsUser.personal_collaborator],
  ],
  [PermissionsUser.personal_assignment]: [
    [PermissionsUser.personal_tracker],
    [PermissionsUser.personal_collaborator],
  ],
  [PermissionsUser.personal_collaborator]: [
    [PermissionsUser.personal_assignment],
    [PermissionsUser.personal_tracker],
  ],
};

const TrailRelationsPermissions = {
  [PermissionsUser.manage_trail]: [
    [PermissionsUser.read_task_type, PermissionsUser.manage_task_type],
  ],
  [PermissionsUser.create_trail]: [
    [PermissionsUser.read_task_type, PermissionsUser.manage_task_type],
  ],
  [PermissionsUser.update_trail]: [
    [PermissionsUser.read_task_type, PermissionsUser.manage_task_type],
  ],
};

const CostRelationsPermissions = {
  [PermissionsUser.manage_cost]: [
    [PermissionsUser.read_project, PermissionsUser.manage_project],
    [PermissionsUser.read_customer, PermissionsUser.manage_customer],
  ],
  [PermissionsUser.create_cost]: [
    [PermissionsUser.read_project, PermissionsUser.manage_project],
    [PermissionsUser.read_customer, PermissionsUser.manage_customer],
  ],
};

// Os valores são uma matriz de 2 dimensões, a primeira dimensão são as permissões obrigatórias a segunda são as opcionais (tem que ter uma delas e não todas elas)
export const RelationsPermissions = {
  ...ProjectRelationsPermissions,

  ...ProductRelationsPermissions,

  ...TaskRelationsPermissions,

  ...AssignmentRelationsPermissions,

  ...CollaboratorRelationsPermissions,

  ...PersonalRelationsPermissions,

  ...TrailRelationsPermissions,

  ...CostRelationsPermissions,

  ...ValueChainRelationsPermissions,
};

export function fixPermissions(permissions: string[]): string[] {
  let fixedPermissions = Array.from(new Set(permissions));

  if (fixedPermissions.includes(PermissionsUser.admin)) {
    // Removendo todas as permissões desnecessarias
    const personalPermissions = fixedPermissions.filter(permission =>
      permission.startsWith('personal_'),
    );

    fixedPermissions = [PermissionsUser.admin, ...personalPermissions];

    return fixedPermissions;
  }

  // Corrigindo Permissões relacionadas
  fixedPermissions.forEach(permission => {
    // Primeiro [] - São as permissões obrigatórias (Tem que ter todas)
    // Segundo [] - São as permissões opcionais entre si (Tem que ter uma e não todas)
    const relationsPermisions = RelationsPermissions[permission];

    if (relationsPermisions) {
      // Passando por cada uma das permissões obrigatórias
      relationsPermisions.forEach(requiredPermission => {
        // Verificando se o usuario possui uma das opções opcionais
        const hasOneOfOptionalPermissions = fixedPermissions.some(perm =>
          requiredPermission.includes(perm),
        );

        // Se não possuir uma das opcionais vai ser adicionado a primeira delas
        if (!hasOneOfOptionalPermissions) {
          fixedPermissions.push(requiredPermission[0]);
        }
      });
    }
  });

  const manageEntities = fixedPermissions
    .filter(permission => permission.includes('manage'))
    .map(permission => {
      const [_, ...entity] = permission.split('_');

      return entity.join('_');
    });

  fixedPermissions = fixedPermissions.filter(permission => {
    const [action, ...entity] = permission.split('_');

    const fixedEntity = entity.join('_');

    if (action !== 'manage' && action !== 'personal' && manageEntities.includes(fixedEntity)) {
      return false;
    }

    return true;
  });

  return fixedPermissions;
}
