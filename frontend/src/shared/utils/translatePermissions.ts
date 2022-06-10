import { PermissionsUser } from '#shared/types/PermissionsUser';

export type ITrasnlatedPermission = { permission: string; translate: string };

type ITranslator = { [key: string]: string };

const actionTranslator: ITranslator = {
  personal: 'pessoal',
  manage: 'manipular',
  read: 'visualizar',
  create: 'criar',
  update: 'editar',
  delete: 'deletar',
};

const entityTranslator: ITranslator = {
  customer: 'clientes',
  project: 'projetos',
  project_type: 'tipos de projeto',
  product: 'produtos',
  product_type: 'tipos de produto',
  measure: 'unidades de medida',
  task: 'tarefas',
  task_type: 'tipos de tarefa',
  collaborator: 'colaboradores',
  collaborator_status: 'status do colaborador',
  assignment: 'atribuiçãos',
  tracker: 'trackers',
  user: 'usuarios',
  role: 'papeis de usuario',
  trail: 'trilhas',
  cost: 'custos',
  portfolio: 'portfolios',
  value_chain: 'cadeia de valor',
  document_type: 'tipo de documento (custos)',
  service: 'serviço (custos)',
  service_provider: 'prestador de serviço (custos)',
  cost_distribution: 'distribuição de custos',
  task_report_comment: 'comentarios relatório',
  operational_objective: 'Objetivos Operacionais',
};

export const translatorPermission = Object.fromEntries(
  Object.values(PermissionsUser).map((permission) => {
    let translation = '';

    if (permission === PermissionsUser.admin) {
      translation = 'administrador';
    } else {
      const [action, ...composeEntity] = permission.split('_');

      const entity = composeEntity.join('_');

      const actionTranslated = actionTranslator[action];

      const entityTranslated = entityTranslator[entity];

      translation = `${actionTranslated} - ${entityTranslated}`;
    }

    return [permission, translation];
  }),
);

export function translatePermissions(permissions: string[]): ITrasnlatedPermission[] {
  return permissions.map<ITrasnlatedPermission>((permission) => {
    return {
      permission,
      translate: translatorPermission[permission],
    };
  });
}
