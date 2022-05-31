import { DEFAULT_ORGANIZATION_IDS } from '#shared/types/backend/IOrganization';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

type IItem = {
  title: string;
  link: string;
  permissions?: string[][];
  organization?: string;
};

type INavigationItem = {
  group: boolean;
  item?: IItem;
  title?: string;
  permissions?: string[][];
  organization?: string;
  items?: IItem[];
};

export const personalPermissions = [
  [PermissionsUser.personal_collaborator],
  [PermissionsUser.personal_assignment],
  [PermissionsUser.personal_tracker],
];

export const navigationsItems: INavigationItem[] = [
  { group: false, item: { title: 'Home', link: '' } },
  { group: false, item: { title: 'Links Úteis', link: '/links' } },
  {
    group: true,
    title: 'Pessoal',
    permissions: personalPermissions,
    organization: '<user>',
    items: [
      {
        title: 'Tarefas Disponíveis',
        link: '/personal/assignments',
        permissions: personalPermissions,
      },
      {
        title: 'Trackers Registrados',
        link: '/personal/trackers',
        permissions: personalPermissions,
      },
      {
        title: 'Reabrir tarefas',
        link: '/personal/assignments/close',
        permissions: personalPermissions,
      },
    ],
  },
  {
    group: false,
    item: {
      title: 'Organizações',
      link: '/organizations',
      permissions: [[PermissionsUser.admin]],
      organization: DEFAULT_ORGANIZATION_IDS.SYSTEM,
    },
  },
  {
    group: false,
    item: {
      title: 'Clientes',
      link: '/customers',
      permissions: [[PermissionsUser.read_customer, PermissionsUser.manage_customer]],
    },
  },
  {
    group: false,
    item: {
      title: 'Portfólios',
      link: '/portfolios',
      permissions: [[PermissionsUser.read_portfolio, PermissionsUser.manage_portfolio]],
    },
  },
  {
    group: true,
    title: 'Projetos',
    permissions: [
      [
        PermissionsUser.read_project_type,
        PermissionsUser.manage_project_type,
        PermissionsUser.read_project,
        PermissionsUser.manage_project,
      ],
    ],
    items: [
      {
        title: 'Tipos de Projetos',
        link: '/project_types',
        permissions: [[PermissionsUser.read_project_type, PermissionsUser.manage_project_type]],
      },
      {
        title: 'Projetos',
        link: '/projects',
        permissions: [[PermissionsUser.read_project, PermissionsUser.manage_project]],
      },
    ],
  },
  {
    group: true,
    title: 'Produtos',
    permissions: [
      [
        PermissionsUser.read_product_type,
        PermissionsUser.manage_product_type,
        PermissionsUser.read_product,
        PermissionsUser.manage_product,
        PermissionsUser.read_measure,
        PermissionsUser.manage_measure,
      ],
    ],
    items: [
      {
        title: 'Unidades de Medida',
        link: '/measures',
        permissions: [[PermissionsUser.read_measure, PermissionsUser.manage_measure]],
      },
      {
        title: 'Tipos de Produtos',
        link: '/product_types',
        permissions: [[PermissionsUser.read_product_type, PermissionsUser.manage_product_type]],
      },
      {
        title: 'Produtos',
        link: '/products',
        permissions: [[PermissionsUser.read_product, PermissionsUser.manage_product]],
      },
      {
        title: 'Relatório',
        link: '/products/report',
        permissions: [[PermissionsUser.read_product, PermissionsUser.manage_product]],
      },
    ],
  },
  {
    group: false,
    item: {
      title: 'Cadeias de valor',
      link: '/value_chains',
      permissions: [[PermissionsUser.read_value_chain, PermissionsUser.manage_value_chain]],
    },
  },
  {
    group: false,
    item: {
      title: 'Trilhas',
      link: '/trails',
      permissions: [[PermissionsUser.read_trail, PermissionsUser.manage_trail]],
    },
  },
  {
    group: false,
    item: {
      title: 'Atribuições',
      link: '/assignments',
      permissions: [[PermissionsUser.read_assignment, PermissionsUser.manage_assignment]],
    },
  },
  {
    group: false,
    item: {
      title: 'Trackers (Admin)',
      link: '/trackers',
      permissions: [[PermissionsUser.read_tracker, PermissionsUser.manage_tracker]],
    },
  },

  {
    group: false,
    item: {
      title: 'Tipos de tarefas',
      link: '/task_types',
      permissions: [[PermissionsUser.read_task_type, PermissionsUser.manage_task_type]],
    },
  },
  {
    group: true,
    title: 'Colaborador',
    permissions: [
      [
        PermissionsUser.read_collaborator,
        PermissionsUser.manage_collaborator,
        PermissionsUser.read_collaborator_status,
        PermissionsUser.manage_collaborator_status,
      ],
    ],
    items: [
      {
        title: 'Colaboradores',
        link: '/collaborators',
        permissions: [[PermissionsUser.read_collaborator, PermissionsUser.manage_collaborator]],
      },
      {
        title: 'Status do Colaborador',
        link: '/collaborators_status',
        permissions: [
          [PermissionsUser.read_collaborator_status, PermissionsUser.manage_collaborator_status],
        ],
      },
    ],
  },
  {
    group: true,
    title: 'Custos',
    permissions: [
      [
        PermissionsUser.read_cost,
        PermissionsUser.manage_cost,

        PermissionsUser.read_document_type,
        PermissionsUser.manage_document_type,

        PermissionsUser.read_service_provider,
        PermissionsUser.manage_service_provider,

        PermissionsUser.read_cost_distribution,
        PermissionsUser.manage_cost_distribution,
      ],
    ],
    items: [
      {
        title: 'Prestador de Serviço',
        link: '/service_providers',
        permissions: [
          [PermissionsUser.read_service_provider, PermissionsUser.manage_service_provider],
        ],
      },
      {
        title: 'Tipos de Documentos',
        link: '/document_types',
        permissions: [[PermissionsUser.read_document_type, PermissionsUser.manage_document_type]],
      },
      {
        title: 'Custos',
        link: '/costs',
        permissions: [[PermissionsUser.read_cost, PermissionsUser.manage_cost]],
      },
      {
        title: 'Distribuição de Custos',
        link: '/cost_distributions',
        permissions: [
          [PermissionsUser.read_cost_distribution, PermissionsUser.manage_cost_distribution],
        ],
      },
    ],
  },
  {
    group: true,
    title: 'Usuarios',
    permissions: [
      [
        PermissionsUser.read_user,
        PermissionsUser.manage_user,
        PermissionsUser.read_role,
        PermissionsUser.manage_role,
      ],
    ],
    items: [
      {
        title: 'Usuarios',
        link: '/users',
        permissions: [[PermissionsUser.read_user, PermissionsUser.manage_user]],
      },
      {
        title: 'Papeis',
        link: '/roles',
        permissions: [[PermissionsUser.read_role, PermissionsUser.manage_role]],
      },
    ],
  },
];
